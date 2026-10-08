import { isTestFile } from '../paths.js'

export const maxFunctionLines = {
  meta: {
    name: 'qvac/max-function-lines',
    description: 'Functions stay short enough to hold in your head.',
    defaultOptions: [{ max: 40 }]
  },
  create(context) {
    if (isTestFile(context.filePath)) return {}

    const { max } = context.options[0]
    const check = (node) => {
      const lines = node.loc.end.line - node.loc.start.line + 1
      if (lines <= max) {
        return
      }

      context.report({
        node,
        message: `Function is ${lines} lines; split out what has its own responsibility (max ${max}).`
      })
    }

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check
    }
  }
}
