const ENCODINGS = new Set([
  'hex',
  'base64',
  'base64url',
  'utf8',
  'utf-8',
  'utf16le',
  'ucs2',
  'latin1',
  'binary',
  'ascii'
])
// only the Buffer methods b4a has a function for, so every report has a direct replacement
const NUMERIC = /^(read|write)(U?Int32|Float|Double)(LE|BE)$/
const SWAPS = new Set(['swap16', 'swap32', 'swap64'])
const BUFFER_MODULE = /^(node:)?buffer$/
const GLOBAL = 'Use b4a instead of the Buffer global; it may not exist on Bare.'

export const preferB4a = {
  meta: {
    name: 'qvac/prefer-b4a',
    description: 'Do byte work through b4a: no Buffer global, buffer module or Buffer methods.'
  },
  create(context) {
    const report = (node, message) => context.report({ node, message })

    return {
      MemberExpression(node) {
        if (isBuffer(node.object)) {
          report(node, GLOBAL)
        }
      },
      NewExpression(node) {
        if (isBuffer(node.callee)) {
          report(node, GLOBAL)
        }
      },
      CallExpression(node) {
        checkCall(context, node)
      },
      ImportDeclaration(node) {
        if (BUFFER_MODULE.test(node.source.value)) {
          report(node, 'Import b4a, not the buffer module.')
        }
      }
    }
  }
}

function checkCall(context, node) {
  if (isBuffer(node.callee)) {
    context.report({ node, message: GLOBAL })
    return
  }

  if (isHexToString(node)) {
    const target = context.source.slice(node.arguments[0].start, node.arguments[0].end)
    context.report({
      node,
      message: 'Use b4a.toHex(buf) for hex.',
      fix: [{ range: [node.start, node.end], text: `b4a.toHex(${target})` }]
    })

    return
  }

  const method = bufferMethod(node)
  if (method) {
    context.report({ node, message: `Use b4a.${method}(buf, …) instead of the Buffer method.` })
  }
}

function isHexToString(call) {
  const { callee, arguments: args } = call
  if (callee.type !== 'MemberExpression' || callee.computed || args.length !== 2) {
    return false
  }

  if (callee.object.type !== 'Identifier' || callee.object.name !== 'b4a') {
    return false
  }

  return (
    callee.property.name === 'toString' && args[1].type === 'Literal' && args[1].value === 'hex'
  )
}

function isBuffer(node) {
  return node.type === 'Identifier' && node.name === 'Buffer'
}

function bufferMethod(call) {
  const { callee } = call
  if (callee.type !== 'MemberExpression' || callee.computed || isBuffer(callee.object)) {
    return null
  }

  if (callee.object.type === 'Identifier' && callee.object.name === 'b4a') {
    return null
  }

  const name = callee.property.name
  const [first] = call.arguments
  if (name === 'toString' && first?.type === 'Literal' && ENCODINGS.has(first.value)) {
    return first.value === 'hex' ? 'toHex' : 'toString'
  }

  if ((name === 'equals' || name === 'compare') && call.arguments.length === 1) {
    return name
  }

  if (NUMERIC.test(name) || SWAPS.has(name)) {
    return name
  }

  return null
}
