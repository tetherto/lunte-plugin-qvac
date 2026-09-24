export const readyGuard = {
  meta: {
    name: 'qvac/ready-guard',
    description: 'Enter async methods with if (!this.opened) await this.ready(), not a bare await.'
  },
  create(context) {
    return {
      AwaitExpression(node) {
        if (!isReadyCall(node.argument)) return

        const statement = context.getParent()
        if (statement?.type !== 'ExpressionStatement') {
          return
        }

        if (isGuarded(context.getAncestors())) {
          return
        }

        context.report({
          node,
          message: 'Guard the open with if (!this.opened) so an opened resource skips the tick.',
          fix: [
            {
              range: [statement.start, statement.end],
              text: 'if (!this.opened) await this.ready()'
            }
          ]
        })
      }
    }
  }
}

export function isReadyCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.arguments.length === 0 &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'ThisExpression' &&
    !node.callee.computed &&
    node.callee.property.name === 'ready'
  )
}

export function isOpenedCheck(test) {
  return (
    test.type === 'UnaryExpression' &&
    test.operator === '!' &&
    test.argument.type === 'MemberExpression' &&
    test.argument.object.type === 'ThisExpression' &&
    test.argument.property.name === 'opened'
  )
}

function isGuarded(ancestors) {
  return ancestors.some((node) => node.type === 'IfStatement' && isOpenedCheck(node.test))
}
