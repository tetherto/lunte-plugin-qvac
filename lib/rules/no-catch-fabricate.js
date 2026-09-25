export const noCatchFabricate = {
  meta: {
    name: 'qvac/no-catch-fabricate',
    description: 'Swallow a rejection with .catch(noop), never an inline closure.'
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node
        if (callee.type !== 'MemberExpression' || callee.computed) {
          return
        }

        if (callee.property.name !== 'catch' || node.arguments.length !== 1) {
          return
        }

        const [handler] = node.arguments
        const result = returnedValue(handler)
        if (result === NOT_INERT) {
          return
        }

        if (result !== undefined && !isDiscarded(context.getAncestors())) {
          return
        }

        context.report({
          node: handler,
          message: 'Swallow with .catch(noop), defined once at the foot of the file.'
        })
      }
    }
  }
}

const NOT_INERT = Symbol('not inert')

function returnedValue(fn) {
  if (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') {
    return NOT_INERT
  }

  if (fn.body.type !== 'BlockStatement') {
    return inertValue(fn.body)
  }

  if (fn.body.body.length === 0) return undefined

  const [only] = fn.body.body
  if (fn.body.body.length !== 1 || only.type !== 'ReturnStatement') {
    return NOT_INERT
  }

  return only.argument ? inertValue(only.argument) : undefined
}

function inertValue(node) {
  switch (node.type) {
    case 'Literal':
      return node
    case 'Identifier':
      return node.name === 'undefined' ? undefined : NOT_INERT
    case 'ObjectExpression':
      return node.properties.length === 0 ? node : NOT_INERT
    case 'ArrayExpression':
      return node.elements.length === 0 ? node : NOT_INERT
    case 'UnaryExpression':
      return node.operator === 'void' && node.argument.type === 'Literal' ? undefined : NOT_INERT
    default:
      return NOT_INERT
  }
}

function isDiscarded(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const parent = ancestors[i]
    if (parent.type === 'ExpressionStatement') {
      return true
    }

    if (parent.type === 'AwaitExpression' || parent.type === 'ChainExpression') {
      continue
    }

    return parent.type === 'UnaryExpression' && parent.operator === 'void'
  }

  return false
}
