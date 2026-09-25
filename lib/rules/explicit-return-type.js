import { isTestFile } from '../paths.js'

const TYPESCRIPT = /\.(ts|tsx|mts|cts)$/
const DECLARATION = /\.d\.[cm]?ts$/
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

export const explicitReturnType = {
  meta: {
    name: 'qvac/explicit-return-type',
    description: 'Exported functions declare their return type.'
  },
  create(context) {
    const path = context.filePath ?? ''
    if (!TYPESCRIPT.test(path) || DECLARATION.test(path) || isTestFile(path)) {
      return {}
    }

    const check = (fn, name) => {
      if (!fn || !FUNCTIONS.has(fn.type) || fn.returnType) return

      context.report({ node: fn, message: `Exported ${name} needs an explicit return type.` })
    }

    return {
      ExportNamedDeclaration(node) {
        const { declaration } = node
        if (declaration?.type === 'FunctionDeclaration') {
          check(declaration, declaration.id.name)
        }

        if (declaration?.type !== 'VariableDeclaration') {
          return
        }

        for (const declarator of declaration.declarations) {
          if (!declarator.id.typeAnnotation) {
            check(declarator.init, declarator.id.name)
          }
        }
      },
      ExportDefaultDeclaration(node) {
        check(node.declaration, 'default function')
      }
    }
  }
}
