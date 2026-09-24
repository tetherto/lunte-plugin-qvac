const NODE_STREAM = /^(node:)?stream(\/.*)?$/

export const noNodeStream = {
  meta: {
    name: 'qvac/no-node-stream',
    description: 'Use streamx, not the Node stream module.'
  },
  create(context) {
    const message = "Use streamx instead of Node's stream; it is lighter and runs on Bare."

    return {
      ImportDeclaration(node) {
        // a type-only import loads nothing, and library typings are written against Node's stream
        if (node.importKind === 'type') return
        if (NODE_STREAM.test(node.source.value)) {
          context.report({ node, message })
        }
      },
      CallExpression(node) {
        const [source] = node.arguments
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') {
          return
        }

        if (source?.type === 'Literal' && NODE_STREAM.test(source.value)) {
          context.report({ node, message })
        }
      }
    }
  }
}
