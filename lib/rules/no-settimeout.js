import { isTestFile, isToolingFile } from '../paths.js'

const TIMERS = new Set(['setTimeout', 'setInterval'])

export const noSettimeout = {
  meta: {
    name: 'qvac/no-settimeout',
    description: 'Question every timer in product code; most are a missing readiness signal.',
    defaultSeverity: 'warning'
  },
  create(context) {
    if (isTestFile(context.filePath) || isToolingFile(context.filePath)) {
      return {}
    }

    return {
      CallExpression(node) {
        const { callee } = node
        const name =
          callee.type === 'MemberExpression' && !callee.computed
            ? callee.property.name
            : callee.name
        if (!TIMERS.has(name)) {
          return
        }

        context.report({
          node,
          message: `${name} in product code; if it waits for something, wait on its signal instead.`
        })
      }
    }
  }
}
