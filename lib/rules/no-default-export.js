import { isTestFile, isToolingFile } from '../paths.js'

const EXEMPT = /\.d\.[cm]?ts$|(^|[\\/])[^\\/]+\.config\.[cm]?[jt]s$/

export const noDefaultExport = {
  meta: {
    name: 'qvac/no-default-export',
    description: 'Product source uses named exports, one concept per file.'
  },
  create(context) {
    const path = context.filePath ?? ''
    if (isTestFile(path) || isToolingFile(path) || EXEMPT.test(path)) {
      return {}
    }

    return {
      ExportDefaultDeclaration(node) {
        context.report({
          node,
          message: 'Use a named export; a default export hides the name at every import.'
        })
      }
    }
  }
}
