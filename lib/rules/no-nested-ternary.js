export const noNestedTernary = {
  meta: {
    name: 'qvac/no-nested-ternary',
    description: 'No ternary inside a ternary.'
  },
  create(context) {
    return {
      ConditionalExpression(node) {
        if (context.getParent()?.type === 'ConditionalExpression') return

        const nested = [node.test, node.consequent, node.alternate].some(
          (child) => child.type === 'ConditionalExpression'
        )
        if (!nested) {
          return
        }

        context.report({ node, message: 'Nested ternary; use if/else or a lookup.' })
      }
    }
  }
}
