const OPERATORS = new Set(['===', '!==', '==', '!='])
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
// one string per byte sequence, so comparing the strings means comparing the bytes
const LOSSLESS = new Set(['hex', 'base64', 'base64url', 'latin1', 'binary'])

export const noStringCompareBytes = {
  meta: {
    name: 'qvac/no-string-compare-bytes',
    description: 'Compare bytes with b4a.equals, not by comparing their string forms.'
  },
  create(context) {
    return {
      BinaryExpression(node) {
        if (!OPERATORS.has(node.operator)) return

        const left = stringOfBytes(node.left)
        const right = stringOfBytes(node.right)
        if (!left || !right) {
          return
        }

        context.report({
          node,
          message:
            'Compare bytes with b4a.equals; string forms allocate, and utf8 decodes different bytes alike.',
          fix: equalsFix(node, { left, right, source: context.source })
        })
      }
    }
  }
}

function stringOfBytes(node) {
  if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') {
    return null
  }

  if (node.callee.computed) return null

  const { object, property } = node.callee
  const [first, second] = node.arguments
  if (object.type === 'Identifier' && object.name === 'b4a') {
    if (property.name === 'toHex' && node.arguments.length === 1) {
      return { bytes: first, encoding: 'hex' }
    }

    if (property.name !== 'toString' || !first) {
      return null
    }

    return { bytes: first, encoding: encodingOf(second) }
  }

  if (property.name !== 'toString' || node.arguments.length > 1) {
    return null
  }

  if (first && encodingOf(first) === null) {
    return null
  }

  return { bytes: object, encoding: first ? encodingOf(first) : 'utf8' }
}

function encodingOf(node) {
  if (!node) return 'utf8'

  return node.type === 'Literal' && ENCODINGS.has(node.value) ? node.value : null
}

// only a lossless encoding compares exactly like the bytes, so only then is the rewrite the same test
function equalsFix(node, { left, right, source }) {
  if (left.encoding !== right.encoding || !LOSSLESS.has(left.encoding)) {
    return undefined
  }

  const text = (part) => source.slice(part.bytes.start, part.bytes.end)
  const call = `b4a.equals(${text(left)}, ${text(right)})`
  const negated = node.operator === '!==' || node.operator === '!='

  return [{ range: [node.start, node.end], text: negated ? `!${call}` : call }]
}
