import { isTestFile } from '../paths.js'

// DataView's littleEndian flag is the platform's own signature
const DATA_VIEW_METHODS = [
  'Int8',
  'Uint8',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
  'BigInt64',
  'BigUint64'
].flatMap((type) => [`get${type}`, `set${type}`])

// value setters and collection methods, where the boolean is the value rather than a flag
const VALUE_METHODS = new Set([
  ...DATA_VIEW_METHODS,
  'add',
  'emit',
  'fill',
  'has',
  'includes',
  'indexOf',
  'push',
  'reject',
  'resolve',
  'set',
  'setItem',
  'unshift',
  'useRef',
  'useState'
])

export const noPositionalBoolean = {
  meta: {
    name: 'qvac/no-positional-boolean',
    description: 'Pass flags as named options, not positional booleans.'
  },
  create(context) {
    if (isTestFile(context.filePath)) return {}

    const check = (node) => {
      if (node.arguments.length < 2 || VALUE_METHODS.has(calleeName(node.callee))) {
        return
      }

      const flag = node.arguments.find(
        (arg) => arg.type === 'Literal' && typeof arg.value === 'boolean'
      )
      if (!flag) {
        return
      }

      context.report({
        node: flag,
        message: 'A positional boolean is unreadable at the call site; pass a named option.'
      })
    }

    return { CallExpression: check, NewExpression: check }
  }
}

function calleeName(callee) {
  if (callee.type === 'Identifier') return callee.name
  if (callee.type === 'MemberExpression' && !callee.computed) {
    return callee.property.name
  }

  return null
}
