import { optionsOf } from '../options.js'

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
    const depths = [0]
    const counted = new Set()

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

    const leave = (node) => {
      if (counted.delete(node)) {
        depths[depths.length - 1]--
      }
    }

    const listeners = {}
    for (const type of NESTING) {
      listeners[type] = enter
      listeners[`${type}:exit`] = leave
    }

    for (const type of FUNCTIONS) {
      listeners[type] = () => depths.push(0)
      listeners[`${type}:exit`] = () => depths.pop()
    }

    return listeners
  }
}

function isElseIf(node, parent) {
  return node.type === 'IfStatement' && parent?.type === 'IfStatement' && parent.alternate === node
}
