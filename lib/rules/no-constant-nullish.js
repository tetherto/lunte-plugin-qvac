const COMPARISONS = new Set(['===', '!==', '==', '!=', '<', '<=', '>', '>=', 'in', 'instanceof'])

export const noConstantNullish = {
  meta: {
    name: 'qvac/no-constant-nullish',
    description: 'No ?? after a value that is never nullish, and no === true on a boolean.'
  },
  create(context) {
    const text = (node) => context.source.slice(node.start, node.end)

    return {
      LogicalExpression(node) {
        if (node.operator !== '??' || !isNeverNullish(node.left)) return

        context.report({
          node,
          message: 'The left side is never null or undefined, so ?? does nothing.',
          fix: [{ range: [node.start, node.end], text: text(node.left) }]
        })
      },
      BinaryExpression(node) {
        const literal = booleanLiteral(node.right)
        if (literal === null || !isBoolean(node.left)) {
          return
        }

        if (node.operator !== '===' && node.operator !== '!==') {
          return
        }

        const keep = (node.operator === '===') === literal
        context.report({
          node,
          message: 'The left side is already a boolean; drop the comparison with a literal.',
          fix: [
            {
              range: [node.start, node.end],
              text: keep ? text(node.left) : `!(${text(node.left)})`
            }
          ]
        })
      }
    }
  }
}

function booleanLiteral(node) {
  return node.type === 'Literal' && typeof node.value === 'boolean' ? node.value : null
}

function isBoolean(node) {
  if (node.type === 'UnaryExpression') {
    return node.operator === '!'
  }

  if (node.type === 'BinaryExpression') {
    return COMPARISONS.has(node.operator)
  }

  if (node.type === 'LogicalExpression' && node.operator !== '??') {
    return isBoolean(node.left) && isBoolean(node.right)
  }

  return node.type === 'Literal' ? typeof node.value === 'boolean' : isB4aEquals(node)
}

function isNeverNullish(node) {
  switch (node.type) {
    case 'Literal':
      return node.value !== null
    case 'TemplateLiteral':
    case 'ObjectExpression':
    case 'ArrayExpression':
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
    case 'NewExpression':
    case 'BinaryExpression':
      return true
    case 'UnaryExpression':
      return node.operator !== 'void'
    case 'LogicalExpression':
      return node.operator !== '??' && isNeverNullish(node.left) && isNeverNullish(node.right)
    default:
      return isB4aEquals(node)
  }
}

function isB4aEquals(node) {
  const { callee } = node

  return (
    node.type === 'CallExpression' &&
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'b4a' &&
    callee.property.name === 'equals'
  )
}
