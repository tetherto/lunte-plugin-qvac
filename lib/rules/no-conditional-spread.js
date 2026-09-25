export const noConditionalSpread = {
  meta: {
    name: 'qvac/no-conditional-spread',
    description: 'Assign optional fields plainly instead of spreading them in conditionally.'
  },
  create(context) {
    return {
      SpreadElement(node) {
        if (context.getParent()?.type !== 'ObjectExpression') return
        if (!isConditionalObject(node.argument)) return

        context.report({
          node,
          message: 'Assign the field plainly and let undefined propagate; no conditional spread.'
        })
      }
    }
  }
}

function isConditionalObject(node) {
  if (node.type === 'ConditionalExpression') {
    const { consequent, alternate } = node
    if (isEmptyObject(consequent) || isEmptyObject(alternate)) {
      return true
    }

    // spreading null or undefined adds nothing, so they are the same empty branch
    return (
      (isNothing(consequent) && alternate.type === 'ObjectExpression') ||
      (isNothing(alternate) && consequent.type === 'ObjectExpression')
    )
  }

  return node.type === 'LogicalExpression' && node.right.type === 'ObjectExpression'
}

function isEmptyObject(node) {
  return node.type === 'ObjectExpression' && node.properties.length === 0
}

function isNothing(node) {
  if (node.type === 'Literal') {
    return node.value === null
  }

  return node.type === 'Identifier' && node.name === 'undefined'
}
