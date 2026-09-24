export const noInitMethod = {
  meta: {
    name: 'qvac/no-init-method',
    description: 'Async setup is ready(), not init().'
  },
  create(context) {
    const message = 'An init() reimplements ready(); use ready-resource and _open() instead.'

    return {
      MethodDefinition(node) {
        if (isInitKey(node)) {
          context.report({ node: node.key, message })
        }
      },
      Property(node) {
        if (isFunction(node.value) && isInitKey(node)) {
          context.report({ node: node.key, message })
        }
      },
      FunctionDeclaration(node) {
        if (node.id?.name === 'init') {
          context.report({ node: node.id, message })
        }
      }
    }
  }
}

function isInitKey(member) {
  return !member.computed && member.key.type === 'Identifier' && member.key.name === 'init'
}

function isFunction(node) {
  return node?.type === 'FunctionExpression' || node?.type === 'ArrowFunctionExpression'
}
