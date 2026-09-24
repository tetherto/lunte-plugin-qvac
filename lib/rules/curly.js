import { isOpenedCheck, isReadyCall } from './ready-guard.js'

const JUMPS = new Set(['ReturnStatement', 'ThrowStatement', 'ContinueStatement', 'BreakStatement'])
const LOOPS = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement'
])
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

export const curly = {
  meta: {
    name: 'qvac/curly',
    description:
      'Braces everywhere, except a one-line guard clause at the top of a function or loop.'
  },
  create(context) {
    const loop = (node) => {
      if (node.body.type !== 'BlockStatement') {
        reportBody(context, node.body)
      }
    }

    return {
      IfStatement(node) {
        if (
          node.consequent.type !== 'BlockStatement' &&
          !isLeadingGuard(node, context.getAncestors())
        ) {
          reportBody(context, node.consequent)
        }

        const { alternate } = node
        if (alternate && alternate.type !== 'BlockStatement' && alternate.type !== 'IfStatement') {
          reportBody(context, alternate)
        }
      },
      ForStatement: loop,
      ForInStatement: loop,
      ForOfStatement: loop,
      WhileStatement: loop,
      DoWhileStatement: loop
    }
  }
}

function reportBody(context, body) {
  context.report({
    node: body,
    message: 'Use braces; only a guard clause at the top of a function or loop may be one line.',
    fix: [
      {
        range: [body.start, body.end],
        text: `{ ${context.source.slice(body.start, body.end)} }`
      }
    ]
  })
}

function isLeadingGuard(node, ancestors) {
  if (!isGuard(node) || node.loc.start.line !== node.loc.end.line) return false

  const block = ancestors[ancestors.length - 1]
  const owner = ancestors[ancestors.length - 2]
  if (block?.type !== 'BlockStatement' || !owner) {
    return false
  }

  if (!FUNCTIONS.has(owner.type) && !LOOPS.has(owner.type)) {
    return false
  }

  const index = block.body.indexOf(node)

  return block.body.slice(0, index).every(isGuard)
}

function isGuard(node) {
  if (node.type !== 'IfStatement' || node.alternate) return false
  if (isReadyGuard(node)) return true

  const body = node.consequent
  if (body.type === 'BlockStatement') {
    return body.body.length === 1 && JUMPS.has(body.body[0].type)
  }

  return JUMPS.has(body.type)
}

// if (!this.opened) await this.ready() is the house entry guard, one line by design
function isReadyGuard(node) {
  const body = node.consequent

  return (
    isOpenedCheck(node.test) &&
    body.type === 'ExpressionStatement' &&
    body.expression.type === 'AwaitExpression' &&
    isReadyCall(body.expression.argument)
  )
}
