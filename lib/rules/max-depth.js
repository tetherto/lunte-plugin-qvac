import { isTestFile } from '../paths.js'
import { optionsOf } from '../options.js'
import { walk } from '../walk.js'

const NESTING = [
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
  'TryStatement'
]
const FUNCTIONS = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']

export const maxDepth = {
  meta: {
    name: 'qvac/max-depth',
    description: 'Blocks nest at most max deep; flatten with early returns or a helper.',
    defaultOptions: [{ max: 3 }]
  },
  create(context) {
    const { max } = optionsOf(context, { max: 3 })
    const closures = isTestFile(context.filePath) ? null : (fn) => reportStateClosures(context, fn)

    return depthListeners(context, { max, onFunction: closures })
  }
}

function depthListeners(context, { max, onFunction }) {
  const depths = [0]
  const counted = new Set()
  const listeners = {}

  const enter = (node) => {
    if (isElseIf(node, context.getParent())) return

    counted.add(node)
    depths[depths.length - 1]++
    if (depths[depths.length - 1] === max + 1) {
      context.report({
        node,
        message: `Blocks nested ${max + 1} deep; flatten with an early return or a helper (max ${max}).`
      })
    }
  }

  for (const type of NESTING) {
    listeners[type] = enter
    listeners[`${type}:exit`] = (node) => {
      if (counted.delete(node)) {
        depths[depths.length - 1]--
      }
    }
  }

  for (const type of FUNCTIONS) {
    listeners[type] = (fn) => {
      depths.push(0)
      onFunction?.(fn)
    }
    listeners[`${type}:exit`] = () => depths.pop()
  }

  return listeners
}

function isElseIf(node, parent) {
  return node.type === 'IfStatement' && parent?.type === 'IfStatement' && parent.alternate === node
}

// a closure that is only called and writes its caller's lets is nesting moved out of sight
function reportStateClosures(context, fn) {
  if (fn.body?.type !== 'BlockStatement') return

  const lets = new Set(topLevelNames(fn.body, 'let'))
  if (lets.size === 0) {
    return
  }

  for (const declarator of topLevelDeclarators(fn.body, 'const')) {
    if (declarator.id.type !== 'Identifier' || !isFunction(declarator.init)) {
      continue
    }

    const written = [...assignedNames(declarator.init.body)].filter((name) => lets.has(name))
    if (written.length === 0 || !onlyCalled(fn.body, declarator)) {
      continue
    }

    context.report({
      node: declarator,
      severity: 'warning',
      message: `${declarator.id.name}() writes ${written.join(', ')} of its caller; return the value instead.`
    })
  }
}

function topLevelDeclarators(block, kind) {
  return block.body
    .filter((statement) => statement.type === 'VariableDeclaration' && statement.kind === kind)
    .flatMap((statement) => statement.declarations)
}

function topLevelNames(block, kind) {
  return topLevelDeclarators(block, kind)
    .filter((declarator) => declarator.id.type === 'Identifier')
    .map((declarator) => declarator.id.name)
}

function isFunction(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression'
}

function assignedNames(body) {
  const names = new Set()
  walk(body, (node) => {
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier') {
      names.add(node.left.name)
    }

    if (node.type === 'UpdateExpression' && node.argument.type === 'Identifier') {
      names.add(node.argument.name)
    }
  })

  return names
}

function onlyCalled(block, declarator) {
  let called = true
  walk(block, (node, parent) => {
    if (node.type !== 'Identifier' || node.name !== declarator.id.name || node === declarator.id) {
      return
    }

    if (parent?.type !== 'CallExpression' || parent.callee !== node) {
      called = false
    }
  })

  return called
}
