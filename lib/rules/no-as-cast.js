import { isTestFile } from '../paths.js'

export const noAsCast = {
  meta: {
    name: 'qvac/no-as-cast',
    description: 'No type assertions outside tests; parse at the boundary instead.'
  },
  create(context) {
    if (isTestFile(context.filePath)) return {}

    const message =
      'No type assertions; parse untrusted data at the boundary and let the type follow.'
    const check = (node) => {
      if (isConst(node.typeAnnotation)) return
      if (context.getParent()?.type === node.type) return

      context.report({ node, message })
    }

    return { TSAsExpression: check, TSTypeAssertion: check }
  }
}

function isConst(type) {
  return (
    type?.type === 'TSTypeReference' &&
    type.typeName.type === 'Identifier' &&
    type.typeName.name === 'const'
  )
}
