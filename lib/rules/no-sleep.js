import { isTestFile, isToolingFile } from '../paths.js'

export const noSleep = {
  meta: {
    name: 'qvac/no-sleep',
    description: 'Wait on the signal that knows, never on a timer.'
  },
  create(context) {
    if (isTestFile(context.filePath) || isToolingFile(context.filePath)) {
      return {}
    }

    const message =
      'Do not sleep to synchronise; wait on the event or promise that signals readiness.'

    return {
      NewExpression(node) {
        if (isSleepPromise(node)) {
          context.report({ node, message })
        }
      },
      ImportDeclaration(node) {
        if (!/(^|[:/])timers\/promises$/.test(node.source.value)) return

        for (const specifier of node.specifiers) {
          if (specifier.imported?.name === 'setTimeout') {
            context.report({ node: specifier, message })
          }
        }
      }
    }
  }
}

function isSleepPromise(node) {
  if (node.callee.type !== 'Identifier' || node.callee.name !== 'Promise') {
    return false
  }

  const [executor] = node.arguments
  if (!executor || !executor.params?.length || executor.params[0].type !== 'Identifier') {
    return false
  }

  const resolve = executor.params[0].name
  const call =
    executor.body.type === 'BlockStatement' ? onlyExpression(executor.body) : executor.body

  return isTimerCall(call) && passesResolve(call.arguments[0], resolve)
}

function onlyExpression(block) {
  return block.body.length === 1 && block.body[0].type === 'ExpressionStatement'
    ? block.body[0].expression
    : null
}

function isTimerCall(node) {
  if (node?.type !== 'CallExpression') return false

  const { callee } = node
  const name = callee.type === 'MemberExpression' ? callee.property.name : callee.name

  return name === 'setTimeout'
}

function passesResolve(arg, resolve) {
  if (!arg) return false
  if (arg.type === 'Identifier') {
    return arg.name === resolve
  }

  if (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression') {
    return false
  }

  const call = arg.body.type === 'BlockStatement' ? onlyExpression(arg.body) : arg.body

  return (
    call?.type === 'CallExpression' &&
    call.callee.type === 'Identifier' &&
    call.callee.name === resolve
  )
}
