const LOOPS = new Set([
  'WhileStatement',
  'DoWhileStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement'
])
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])
const EXITS = new Set(['ReturnStatement', 'ThrowStatement', 'BreakStatement'])

export const preferForAwait = {
  meta: {
    name: 'qvac/prefer-for-await',
    description: 'Drain an iterator with for await instead of calling next() in a loop.'
  },
  create(context) {
    const check = (node) => {
      const iterator = pulledIterator(node)
      if (!iterator || !drains(node)) {
        return
      }

      if (!ownsIterator(node, { iterator, siblings: siblingsOf(context.getParent()) })) {
        return
      }

      context.report({
        node,
        message: 'Drain the iterator with for await (const x of it) instead of awaiting it.next().'
      })
    }

    return { WhileStatement: check, DoWhileStatement: check, ForStatement: check }
  }
}

function pulledIterator(loop) {
  for (const part of [loop.init, loop.test, loop.update, loop.body]) {
    const pull = find(part, isNextAwait)
    if (pull?.argument.callee.object.type === 'Identifier') {
      return pull.argument.callee.object.name
    }
  }

  return null
}

function siblingsOf(block) {
  return block?.body ?? block?.consequent ?? []
}

// stopping on anything but done leaves the iterator open for later, which for await would close
function drains(loop) {
  const parts = [loop.init, loop.test, loop.update, loop.body]
  const readsDone = parts.some((part) => find(part, isDoneReference))
  const stopsOnDone = !loop.test || isTrue(loop.test) || find(loop.test, isDoneReference)

  return readsDone && stopsOnDone && !exitsEarly(loop.body, { nested: false })
}

// only a local iterator opened here, pulled by nothing but this loop, is the loop's to drain
function ownsIterator(loop, { iterator, siblings }) {
  const created = siblings.findIndex((statement) => declaresIterator(statement, iterator))
  const index = siblings.indexOf(loop)
  if (created === -1 || created > index) {
    return false
  }

  const between = siblings.slice(created + 1, index)
  const advanced = between.some((s) => !isPriming(s, { iterator, loop }) && pullsFrom(s, iterator))
  const escapes = siblings.slice(created).some((s) => usesBeyondNext(s, { name: iterator }))

  return !advanced && !escapes
}

function declaresIterator(statement, iterator) {
  if (statement.type !== 'VariableDeclaration') return false

  return statement.declarations.some(
    (d) => d.id.type === 'Identifier' && d.id.name === iterator && isAsyncIteratorCall(d.init)
  )
}

// let next = await it.next() before a loop that tests next is the loop's own first pull
function isPriming(statement, { iterator, loop }) {
  if (statement.type !== 'VariableDeclaration' || statement.declarations.length !== 1) {
    return false
  }

  const { id, init } = statement.declarations[0]
  if (!init || !isNextAwait(init) || id.type !== 'Identifier') {
    return false
  }

  if (init.argument.callee.object.name !== iterator) {
    return false
  }

  return Boolean(find(loop.test, (node) => node.type === 'Identifier' && node.name === id.name))
}

function pullsFrom(statement, iterator) {
  return Boolean(
    find(statement, (node) => isNextAwait(node) && node.argument.callee.object.name === iterator)
  )
}

function usesBeyondNext(node, { name, parent = null }) {
  if (!isNode(node)) return false
  if (node.type === 'Identifier' && node.name === name) {
    const isNextCallee =
      parent?.type === 'MemberExpression' &&
      parent.object === node &&
      parent.property.name === 'next'
    const isDeclaration = parent?.type === 'VariableDeclarator' && parent.id === node

    return !isNextCallee && !isDeclaration
  }

  return Object.values(node).some((value) => {
    if (Array.isArray(value)) {
      return value.some((item) => usesBeyondNext(item, { name, parent: node }))
    }

    return usesBeyondNext(value, { name, parent: node })
  })
}

function isAsyncIteratorCall(node) {
  if (node?.type !== 'CallExpression') return false

  const { callee } = node

  return (
    callee.type === 'MemberExpression' &&
    callee.computed &&
    callee.property.type === 'MemberExpression' &&
    callee.property.object.name === 'Symbol' &&
    callee.property.property.name === 'asyncIterator'
  )
}

function exitsEarly(node, { nested }) {
  if (!isNode(node) || FUNCTIONS.has(node.type)) return false
  if (node.type === 'IfStatement' && find(node.test, isDoneReference)) {
    return exitsEarly(node.alternate, { nested })
  }

  if (EXITS.has(node.type)) {
    return !(node.type === 'BreakStatement' && !node.label && nested)
  }

  const inner = nested || LOOPS.has(node.type) || node.type === 'SwitchStatement'

  return children(node).some((child) => exitsEarly(child, { nested: inner }))
}

function find(node, predicate) {
  if (!isNode(node) || FUNCTIONS.has(node.type)) return null
  if (predicate(node)) return node

  for (const child of children(node)) {
    const found = find(child, predicate)
    if (found) {
      return found
    }
  }

  return null
}

// a callee named done is a callback, not the iterator's done flag
function children(node) {
  const bareCallee = node.type === 'CallExpression' && node.callee.type === 'Identifier'
  const values = Object.entries(node)
    .filter(([key]) => !(bareCallee && key === 'callee'))
    .map(([, value]) => value)

  return values.flatMap((value) => {
    if (Array.isArray(value)) return value.filter(isNode)

    return isNode(value) ? [value] : []
  })
}

function isTrue(node) {
  return node.type === 'Literal' && node.value === true
}

function isNode(value) {
  return typeof value?.type === 'string'
}

function isDoneReference(node) {
  if (node.type === 'Identifier') return node.name === 'done'

  return node.type === 'MemberExpression' && !node.computed && node.property.name === 'done'
}

function isNextAwait(node) {
  if (node.type !== 'AwaitExpression') return false

  const call = node.argument

  return (
    call.type === 'CallExpression' &&
    call.arguments.length === 0 &&
    call.callee.type === 'MemberExpression' &&
    !call.callee.computed &&
    call.callee.property.name === 'next'
  )
}
