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

export const noBufferGlobal = {
  meta: {
    name: 'qvac/no-buffer-global',
    description: 'Use b4a instead of the Buffer global and Buffer methods.'
  },
  create(context) {
    const report = (node, message) => context.report({ node, message })
    const global = 'Use b4a instead of the Buffer global; it may not exist on Bare.'

    return {
      MemberExpression(node) {
        if (isBuffer(node.object)) {
          report(node, global)
        }
      },
      NewExpression(node) {
        if (isBuffer(node.callee)) {
          report(node, global)
        }
      },
      CallExpression(node) {
        if (isBuffer(node.callee)) {
          report(node, global)
          return
        }

        const method = bufferMethod(node)
        if (method) {
          report(node, `Use b4a.${method}(buf, …) instead of the Buffer method.`)
        }
      },
      ImportDeclaration(node) {
        if (BUFFER_MODULE.test(node.source.value)) {
          report(node, 'Import b4a, not the buffer module.')
        }
      }
    }
  }
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
