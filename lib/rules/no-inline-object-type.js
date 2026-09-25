const TYPESCRIPT = /\.(ts|tsx|mts|cts)$/
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

export const noInlineObjectType = {
  meta: {
    name: 'qvac/no-inline-object-type',
    description: 'Name the object types in a function signature with an interface.'
  },
  create(context) {
    if (!TYPESCRIPT.test(context.filePath ?? '')) {
      return {}
    }

    const report = (node) => {
      context.report({
        node,
        message: 'Name this object type with an interface instead of writing it in the signature.'
      })
    }

    const check = (fn) => {
      for (const param of fn.params) {
        const literal = findTypeLiteral(annotationOf(param))
        if (literal) {
          report(literal)
        }
      }

      const literal = findTypeLiteral(fn.returnType)
      if (literal) {
        report(literal)
      }
    }

    const listeners = {}
    for (const type of FUNCTIONS) {
      listeners[type] = check
    }

    return listeners
  }
}

function annotationOf(param) {
  if (param.type === 'AssignmentPattern') return param.left.typeAnnotation
  if (param.type === 'TSParameterProperty') {
    return annotationOf(param.parameter)
  }

  return param.typeAnnotation
}

function findTypeLiteral(node) {
  if (!node || typeof node.type !== 'string') return null
  if (node.type === 'TSTypeLiteral') return node

  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc') continue
    const children = Array.isArray(value) ? value : [value]
    for (const child of children) {
      const found = child && typeof child.type === 'string' ? findTypeLiteral(child) : null
      if (found) {
        return found
      }
    }
  }

  return null
}
