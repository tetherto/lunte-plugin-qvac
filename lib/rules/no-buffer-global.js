export const noBufferGlobal = {
  meta: {
    name: 'qvac/no-buffer-global',
    description: 'Use b4a instead of the Buffer global.'
  },
  create(context) {
    const message = 'Use b4a instead of the Buffer global; it may not exist on Bare.'

    return {
      MemberExpression(node) {
        if (isBuffer(node.object)) {
          context.report({ node, message })
        }
      },
      NewExpression(node) {
        if (isBuffer(node.callee)) {
          context.report({ node, message })
        }
      },
      CallExpression(node) {
        if (isBuffer(node.callee)) {
          context.report({ node, message })
        }
      }
    }
  }
}

function isBuffer(node) {
  return node.type === 'Identifier' && node.name === 'Buffer'
}
