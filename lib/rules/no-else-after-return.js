const EXITS = new Set(['ReturnStatement', 'ThrowStatement'])
const LEXICAL = new Set(['VariableDeclaration', 'ClassDeclaration', 'FunctionDeclaration'])

export const noElseAfterReturn = {
  meta: {
    name: 'qvac/no-else-after-return',
    description: 'No else after an if that returns; the early return already ended the branch.'
  },
  create(context) {
    return {
      IfStatement(node) {
        const { alternate } = node
        if (!alternate || alternate.type === 'IfStatement') {
          return
        }

        if (!alwaysExits(node.consequent)) {
          return
        }

        const parent = context.getParent()
        if (parent?.type === 'IfStatement' && parent.alternate === node) {
          return
        }

        context.report({
          node: alternate,
          message: 'The if already returns; drop the else and dedent its body.',
          fix: unwrapFix(node, context.source)
        })
      }
    }
  }
}

function alwaysExits(statement) {
  if (EXITS.has(statement.type)) return true
  if (statement.type !== 'BlockStatement') return false

  const last = statement.body[statement.body.length - 1]

  return !!last && EXITS.has(last.type)
}

function unwrapFix(node, source) {
  const { consequent, alternate } = node
  if (/\/[/*]/.test(source.slice(consequent.end, alternate.start))) {
    return undefined
  }

  if (alternate.type !== 'BlockStatement') {
    return [
      {
        range: [consequent.end, node.end],
        text: `\n${source.slice(alternate.start, alternate.end)}`
      }
    ]
  }

  // unwrapped declarations would join the enclosing scope and could collide with its names
  if (alternate.body.some((statement) => LEXICAL.has(statement.type))) {
    return undefined
  }

  return [
    {
      range: [consequent.end, node.end],
      text: `\n${source.slice(alternate.start + 1, alternate.end - 1)}`
    }
  ]
}
