import { sourceOf } from '../walk.js'

export const preferNarrowingCheck = {
  meta: {
    name: 'qvac/prefer-narrowing-check',
    description:
      'Check presence in a form TypeScript narrows: !!x, not Boolean(x); x?.y, not x ? x.y : null.'
  },
  create(context) {
    return {
      CallExpression: (node) => checkBoolean(context, node),
      ConditionalExpression: (node) => checkTernary(context, node)
    }
  }
}

function checkBoolean(context, node) {
  const { callee, arguments: args } = node
  if (callee.type !== 'Identifier' || callee.name !== 'Boolean' || args.length !== 1) {
    return
  }

  const parent = context.getParent()
  if (parent?.type !== 'LogicalExpression' || parent.left !== node) {
    return
  }

  context.report({
    node,
    message: 'Boolean(x) does not narrow x; use !!x.',
    fix: [{ range: [node.start, node.end], text: `!!(${sourceOf(context, args[0])})` }]
  })
}

function checkTernary(context, node) {
  const { test, consequent, alternate } = node
  if (consequent.type !== 'MemberExpression' || consequent.computed) {
    return
  }

  if (sourceOf(context, consequent.object) !== sourceOf(context, test)) {
    return
  }

  const nullish = alternate.type === 'Literal' && alternate.value === null
  const missing = alternate.type === 'Identifier' && alternate.name === 'undefined'
  if (!nullish && !missing) {
    return
  }

  const chained = `${sourceOf(context, test)}?.${sourceOf(context, consequent.property)}`
  context.report({
    node,
    message: 'Use optional chaining for a property of something that may be absent.',
    fix: [{ range: [node.start, node.end], text: nullish ? `${chained} ?? null` : chained }]
  })
}
