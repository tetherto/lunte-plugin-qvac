import { isTestFile } from '../paths.js'

export const noNonNullAssertion = {
  meta: {
    name: 'qvac/no-non-null-assertion',
    description: 'No ! assertions outside tests; narrow the value or make the field non-null.'
  },
  create(context) {
    if (isTestFile(context.filePath)) return {}

    const message =
      'A ! is a cast; narrow the value, or give the field a type that is set when read.'
    const definite = (node) => {
      if (node.definite) {
        context.report({ node, message })
      }
    }

    return {
      TSNonNullExpression(node) {
        context.report({ node, message })
      },
      VariableDeclarator: definite,
      PropertyDefinition: definite
    }
  }
}
