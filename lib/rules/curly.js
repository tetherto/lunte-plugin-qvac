import { optionsOf } from '../options.js'
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
const PLAIN = new Set(['Literal', 'Identifier', 'ThisExpression', 'TemplateLiteral'])
const DEFAULTS = { maxGuards: 2, maxLength: 80 }

export const curly = {
  meta: {
    name: 'qvac/curly',
    description:
      'Braces everywhere, except a short one-line guard clause at the top of a function or loop.',
    defaultOptions: [DEFAULTS]
  },
  create(context) {
    const limits = { ...optionsOf(context, DEFAULTS), source: context.source }
    const loop = (node) => {
      if (node.body.type !== 'BlockStatement') {
        reportBody(context, node.body)
      }
    }

    return {
      IfStatement(node) {
        if (
          node.consequent.type !== 'BlockStatement' &&
          !isLeadingGuard(node, { ancestors: context.getAncestors(), limits })
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
    message:
      'Use braces; a one-line if is only for a short guard with a plain value at the top of a function or loop.',
    fix: [
      {
        range: [body.start, body.end],
        text: `{ ${context.source.slice(body.start, body.end)} }`
      }
    ]
  })
}

function isLeadingGuard(node, { ancestors, limits }) {
  if (!isGuard(node) || node.loc.start.line !== node.loc.end.line) return false
  if (!isShort(node, limits) || !isPlain(node)) return false

  const block = ancestors[ancestors.length - 1]
  const owner = ancestors[ancestors.length - 2]
  if (block?.type !== 'BlockStatement' || !owner) {
    return false
  }

  if (!FUNCTIONS.has(owner.type) && !LOOPS.has(owner.type)) {
    return false
  }

  const before = block.body.slice(0, block.body.indexOf(node))
  if (!before.every(isGuard)) {
    return false
  }

  return (
    before.filter((guard) => guard.consequent.type !== 'BlockStatement').length < limits.maxGuards
  )
}

function isShort(node, { source, maxLength }) {
  const lineStart = source.lastIndexOf('\n', node.start - 1) + 1
  const lineEnd = source.indexOf('\n', node.end)

  return source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd).length <= maxLength
}

// a guard that computes its answer is business logic, which reads better in a block
function isPlain(node) {
  const body = node.consequent
  if (body.type === 'ReturnStatement') {
    return !body.argument || isPlainValue(body.argument)
  }

  if (body.type !== 'ThrowStatement') {
    return true
  }

  const error = body.argument

  return (
    error.type === 'Identifier' ||
    (error.type === 'NewExpression' && error.arguments.every(isPlainValue))
  )
}

function isPlainValue(node) {
  if (node.type === 'ArrayExpression') {
    return node.elements.length === 0
  }

  if (node.type === 'ObjectExpression') {
    return node.properties.length === 0
  }

  if (PLAIN.has(node.type)) {
    return node.type !== 'TemplateLiteral' || node.expressions.every(isPlainValue)
  }

  if (node.type === 'UnaryExpression') {
    return isPlainValue(node.argument)
  }

  if (node.type === 'MemberExpression') {
    return !node.computed && isPlainValue(node.object)
  }

  if (node.type === 'ChainExpression') {
    return isPlainValue(node.expression)
  }

  return false
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
