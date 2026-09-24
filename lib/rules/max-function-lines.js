import { isTestFile } from '../paths.js'

const MAX = 40

export const maxFunctionLines = {
  meta: {
    name: 'qvac/max-function-lines',
    description: 'Functions stay short enough to hold in your head.',
    defaultSeverity: 'warning'
  },
  create(context) {
    if (isTestFile(context.filePath)) return {}

    const check = (node) => {
      const lines = node.loc.end.line - node.loc.start.line + 1
      if (lines <= MAX) {
        return
      }

      context.report({
        node,
        message: `Function is ${lines} lines; split out what has its own responsibility (max ${MAX}).`
      })
    }

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check
    }
  }
}
