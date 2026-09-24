export const noExplicitAny = {
  meta: {
    name: 'qvac/no-explicit-any',
    description: 'No any; narrow unknown data at the boundary.'
  },
  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({
          node,
          message: 'No any; type it, or take unknown at the boundary and narrow it.'
        })
      }
    }
  }
}
