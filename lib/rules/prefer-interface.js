export const preferInterface = {
  meta: {
    name: 'qvac/prefer-interface',
    description: 'Declare an object shape with interface, not a type alias.'
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation.type !== 'TSTypeLiteral') return

        context.report({
          node,
          message: 'Declare the object shape as an interface.',
          fix: interfaceFix(node, context.source)
        })
      }
    }
  }
}

function interfaceFix(node, source) {
  const head = source.slice(node.id.start, (node.typeParameters ?? node.id).end)
  const declare = node.declare ? 'declare ' : ''

  return [
    { range: [node.start, node.typeAnnotation.start], text: `${declare}interface ${head} ` },
    { range: [node.typeAnnotation.end, node.end], text: '' }
  ]
}
