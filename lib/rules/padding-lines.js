const COMPOUND = new Set([
  'BlockStatement',
  'DoWhileStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'IfStatement',
  'LabeledStatement',
  'SwitchStatement',
  'TryStatement',
  'WhileStatement'
])
const EXITS = new Set(['ReturnStatement', 'ThrowStatement'])

export const paddingLines = {
  meta: {
    name: 'qvac/padding-lines',
    description:
      'A blank line after a multi-line block, and before the closing return of a longer block.'
  },
  create(context) {
    const check = (statements) => {
      for (let i = 1; i < statements.length; i++) {
        const previous = statements[i - 1]
        const next = statements[i]
        if (hasBlankLine(context.source, previous, next)) {
          continue
        }

        const message = expectedBlank(statements, i)
        if (!message) {
          continue
        }

        const lineEnd = context.source.indexOf('\n', previous.end)
        const fix =
          lineEnd === -1 || lineEnd > next.start
            ? undefined
            : [{ range: [lineEnd, lineEnd], text: '\n' }]
        context.report({ node: next, message, fix })
      }
    }

    return {
      Program: (node) => check(node.body),
      BlockStatement: (node) => check(node.body),
      StaticBlock: (node) => check(node.body),
      SwitchCase: (node) => check(node.consequent)
    }
  }
}

function expectedBlank(statements, i) {
  const previous = statements[i - 1]
  const next = statements[i]

  if (COMPOUND.has(previous.type) && previous.loc.start.line !== previous.loc.end.line) {
    return 'Expected a blank line after a multi-line block.'
  }

  if (EXITS.has(next.type) && i === statements.length - 1 && statements.length >= 3) {
    return 'Expected a blank line before the closing return or throw.'
  }

  return null
}

function hasBlankLine(source, previous, next) {
  return /\n[ \t]*\r?\n/.test(source.slice(previous.end, next.start))
}
