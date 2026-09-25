import { isTestFile } from '../paths.js'
import { optionsOf } from '../options.js'
import { walk } from '../walk.js'

const DB_METHODS = new Set(['get', 'find', 'findOne', 'insert', 'delete', 'put', 'collection'])
const DEFAULTS = {
  pattern: '^@[a-z0-9-]+/[a-z0-9-]+$',
  home: '(^|[\\\\/])schema[\\\\/]|(^|[\\\\/])collections\\.[cm]?[jt]s$'
}
const MESSAGE = 'Import the collection name from its home module instead of spelling it here.'

export const noInlineCollectionName = {
  meta: {
    name: 'qvac/no-inline-collection-name',
    description: 'Spell a collection name once, in its home module, and import it everywhere else.',
    defaultOptions: [DEFAULTS]
  },
  create(context) {
    const { pattern, home } = optionsOf(context, DEFAULTS)
    const path = context.filePath ?? ''
    if (isTestFile(path) || new RegExp(home).test(path)) {
      return {}
    }

    const names = new RegExp(pattern)

    return { Program: (program) => checkProgram(context, { program, names }) }
  }
}

function checkProgram(context, { program, names }) {
  const isName = (node) =>
    node?.type === 'Literal' && typeof node.value === 'string' && names.test(node.value)
  const constants = new Map()
  const passed = new Set()

  walk(program, (node) => {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && isName(node.init)) {
      constants.set(node.id.name, node)
    }

    if (!isDbCall(node)) {
      return
    }

    const [first] = node.arguments
    if (isName(first)) {
      context.report({ node: first, message: MESSAGE })
    }

    if (first?.type === 'Identifier') {
      passed.add(first.name)
    }
  })

  for (const [name, declarator] of constants) {
    if (passed.has(name)) {
      context.report({ node: declarator, message: MESSAGE })
    }
  }
}

function isDbCall(node) {
  if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') {
    return false
  }

  return !node.callee.computed && DB_METHODS.has(node.callee.property.name)
}
