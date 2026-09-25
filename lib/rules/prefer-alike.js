import { isTestFile } from '../paths.js'

export const preferAlike = {
  meta: {
    name: 'qvac/prefer-alike',
    description: 'In tests, assert with t.alike, t.is and t.absent so a failure shows both sides.'
  },
  create(context) {
    if (!isTestFile(context.filePath)) return {}

    const text = (node) => context.source.slice(node.start, node.end)

    return {
      CallExpression(node) {
        const assertion = rewrite(node)
        if (!assertion) {
          return
        }

        const [operands, ...rest] = [assertion.args.map(text), ...node.arguments.slice(1).map(text)]
        const call = `${text(node.callee.object)}.${assertion.method}(${[...operands, ...rest].join(', ')})`
        context.report({
          node,
          message: `Use t.${assertion.method}, which prints both sides when it fails.`,
          fix: [{ range: [node.start, node.end], text: call }]
        })
      }
    }
  }
}

function rewrite(node) {
  const { callee } = node
  if (
    callee.type !== 'MemberExpression' ||
    callee.computed ||
    callee.object.type !== 'Identifier'
  ) {
    return null
  }

  const name = callee.property.name
  const [subject] = node.arguments
  if ((name !== 'ok' && name !== 'absent') || !subject) {
    return null
  }

  const positive = name === 'ok'
  if (isB4aEquals(subject)) {
    return { method: positive ? 'alike' : 'unlike', args: subject.arguments }
  }

  if (
    subject.type === 'BinaryExpression' &&
    (subject.operator === '===' || subject.operator === '!==')
  ) {
    const same = (subject.operator === '===') === positive

    return { method: same ? 'is' : 'not', args: [subject.left, subject.right] }
  }

  if (positive && subject.type === 'UnaryExpression' && subject.operator === '!') {
    return { method: 'absent', args: [subject.argument] }
  }

  return null
}

function isB4aEquals(node) {
  const { callee } = node

  return (
    node.type === 'CallExpression' &&
    node.arguments.length === 2 &&
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'b4a' &&
    callee.property.name === 'equals'
  )
}
