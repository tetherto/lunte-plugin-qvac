import { isTestFile } from '../paths.js'
import { optionsOf } from '../options.js'

const DEFAULTS = { home: '(^|[\\\\/])guards\\.[cm]?[jt]s$' }

export const noHandRolledGuard = {
  meta: {
    name: 'qvac/no-hand-rolled-guard',
    description:
      'Import the shared isRecord and error-message guards instead of writing new copies.',
    defaultOptions: [DEFAULTS]
  },
  create(context) {
    const { home } = optionsOf(context, DEFAULTS)
    const path = context.filePath ?? ''
    if (isTestFile(path) || new RegExp(home).test(path)) {
      return {}
    }

    return {
      LogicalExpression(node) {
        if (isObjectCheck(node)) {
          context.report({
            node,
            message: 'Import the shared isRecord guard instead of checking typeof object here.'
          })
        }
      },
      ConditionalExpression(node) {
        if (isErrorMessage(node)) {
          context.report({
            node,
            message: 'Import the shared error-message helper instead of writing it inline.'
          })
        }
      }
    }
  }
}

// typeof v === 'object' && v !== null, in either order
function isObjectCheck(node) {
  if (node.operator !== '&&') return false

  const sides = [node.left, node.right]
  const typeofSide = sides.find(isTypeofObject)
  const nullSide = sides.find((side) => side !== typeofSide)
  if (!typeofSide || !isNotNull(nullSide)) {
    return false
  }

  return sameName(typeofSide.left.argument, nullSide.left)
}

function isTypeofObject(node) {
  return (
    node.type === 'BinaryExpression' &&
    node.operator === '===' &&
    node.left.type === 'UnaryExpression' &&
    node.left.operator === 'typeof' &&
    node.right.type === 'Literal' &&
    node.right.value === 'object'
  )
}

function isNotNull(node) {
  return (
    node.type === 'BinaryExpression' &&
    (node.operator === '!==' || node.operator === '!=') &&
    node.right.type === 'Literal' &&
    node.right.value === null
  )
}

// e instanceof Error ? e.message : String(e)
function isErrorMessage(node) {
  const { test, consequent, alternate } = node
  if (test.type !== 'BinaryExpression' || test.operator !== 'instanceof') {
    return false
  }

  if (test.right.type !== 'Identifier' || test.right.name !== 'Error') {
    return false
  }

  if (consequent.type !== 'MemberExpression' || consequent.property.name !== 'message') {
    return false
  }

  return alternate.type === 'CallExpression' && alternate.callee.name === 'String'
}

function sameName(a, b) {
  return a.type === 'Identifier' && b.type === 'Identifier' && a.name === b.name
}
