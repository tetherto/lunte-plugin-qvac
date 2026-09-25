const MAX = 3

export const maxParams = {
  meta: {
    name: 'qvac/max-params',
    description: 'At most three positional parameters; the rest goes in an options object.'
  },
  create(context) {
    const check = (node) => {
      const params = node.params.filter(
        (param) => !(param.type === 'Identifier' && param.name === 'this')
      )
      if (params.length <= MAX) {
        return
      }

      context.report({
        node: params[MAX],
        message: `${params.length} positional parameters; keep one or two subjects and pass the rest as an object.`
      })
    }

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check
    }
  }
}
