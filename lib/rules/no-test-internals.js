import { isTestFile } from '../paths.js'
import { walk } from '../walk.js'

const KEYED_REFLECT = new Set([
  'get',
  'set',
  'has',
  'defineProperty',
  'deleteProperty',
  'getOwnPropertyDescriptor'
])
const INSTEAD =
  'drive it through the Client and the test harness; if that is impossible, skip this line with a reason.'

export const noTestInternals = {
  meta: {
    name: 'qvac/no-test-internals',
    description: 'Tests drive the library through its API, never through its internals.'
  },
  create(context) {
    if (!isTestFile(context.filePath)) return {}

    return { Program: (program) => checkProgram(context, program) }
  }
}

function checkProgram(context, program) {
  const local = localClasses(program)
  const patched = new Set()
  const report = (node, what) => context.report({ node, message: `${what}; ${INSTEAD}` })

  walk(program, (node) => {
    if (node.type === 'AssignmentExpression' && isForeignPrototype(node.left.object, local)) {
      patched.add(node.left)
      report(node.left, 'Do not patch a library prototype')
    } else if (node.type === 'CallExpression' && isPrototypeDefine(node, local)) {
      report(node, 'Do not patch a library prototype')
    } else if (node.type === 'MemberExpression' && !patched.has(node) && isPrivateAccess(node)) {
      report(node.property, `Do not reach into the private ${privateName(node.property)}`)
    } else if (node.type === 'CallExpression' && isPrivateReflect(node)) {
      report(node.arguments[1], `Do not reach into the private ${node.arguments[1].value}`)
    }
  })
}

function localClasses(program) {
  const names = new Set()

  walk(program, (node) => {
    if ((node.type === 'ClassDeclaration' || node.type === 'FunctionDeclaration') && node.id) {
      names.add(node.id.name)
    } else if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'Identifier' &&
      /^(Class|Function)Expression$/.test(node.init?.type ?? '')
    ) {
      names.add(node.id.name)
    }
  })

  return names
}

function isForeignPrototype(node, local) {
  if (node?.type !== 'MemberExpression' || propertyName(node) !== 'prototype') {
    return false
  }

  return !(node.object.type === 'Identifier' && local.has(node.object.name))
}

function isPrototypeDefine(node, local) {
  return isCallOf(node, 'Object', 'defineProperty') && isForeignPrototype(node.arguments[0], local)
}

function isPrivateAccess(node) {
  return node.object.type !== 'ThisExpression' && isPrivateName(propertyName(node))
}

function isPrivateReflect(node) {
  const method = propertyName(node.callee)
  if (!KEYED_REFLECT.has(method) || !isCallOf(node, 'Reflect', method)) {
    return false
  }

  const key = node.arguments[1]

  return key?.type === 'Literal' && isPrivateName(key.value)
}

function isCallOf(node, object, method) {
  const { callee } = node

  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === object &&
    propertyName(callee) === method
  )
}

function propertyName(node) {
  if (node?.type !== 'MemberExpression') return null
  if (!node.computed) {
    return node.property.type === 'Identifier' ? node.property.name : null
  }

  return node.property.type === 'Literal' && typeof node.property.value === 'string'
    ? node.property.value
    : null
}

function privateName(property) {
  return property.type === 'Literal' ? property.value : property.name
}

function isPrivateName(name) {
  return typeof name === 'string' && name.length > 1 && name.startsWith('_')
}
