export const linesBetweenClassMembers = {
  meta: {
    name: 'qvac/lines-between-class-members',
    description: 'A blank line between class members when either spans several lines.'
  },
  create(context) {
    return {
      ClassBody(node) {
        for (let i = 1; i < node.body.length; i++) {
          const previous = node.body[i - 1]
          const next = node.body[i]
          if (!spansLines(previous) && !spansLines(next)) {
            continue
          }

          if (/\n[ \t]*\r?\n/.test(context.source.slice(previous.end, next.start))) {
            continue
          }

          const lineEnd = context.source.indexOf('\n', previous.end)
          const fix =
            lineEnd === -1 || lineEnd > next.start
              ? undefined
              : [{ range: [lineEnd, lineEnd], text: '\n' }]
          context.report({
            node: next,
            message: 'Expected a blank line between class members.',
            fix
          })
        }
      }
    }
  }
}

function spansLines(node) {
  return node.loc.start.line !== node.loc.end.line
}
