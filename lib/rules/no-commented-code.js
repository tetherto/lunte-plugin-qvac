import { parse } from 'lunte/src/core/parser.js'

import { getComments, isDirective, isOwnLine } from '../comments.js'

const CODE_EXPRESSIONS = new Set([
  'ArrowFunctionExpression',
  'AssignmentExpression',
  'AwaitExpression',
  'CallExpression',
  'NewExpression',
  'UpdateExpression',
  'YieldExpression'
])
const PROSE_STATEMENTS = new Set(['EmptyStatement', 'LabeledStatement'])

export const noCommentedCode = {
  meta: {
    name: 'qvac/no-commented-code',
    description: 'No commented-out code; git remembers it.'
  },
  create(context) {
    return {
      Program() {
        for (const group of groupComments(getComments(context), context.source)) {
          const code = commentedCode(group)
          if (!code) {
            continue
          }

          context.report({ node: code, message: 'Commented-out code; delete it, git remembers.' })
        }
      }
    }
  }
}

// a multi-line statement only parses as a whole, and one line of code can sit inside prose
function commentedCode(group) {
  if (isCode(group.map((comment) => comment.value).join('\n'))) {
    return group[0]
  }

  if (group.length === 1) return null

  return group.find((comment) => isCode(comment.value)) ?? null
}

function groupComments(comments, source) {
  const groups = []
  let current = null

  for (const comment of comments) {
    if (isDirective(comment)) {
      current = null
      continue
    }

    const previous = current?.[current.length - 1]
    const continues =
      comment.type === 'Line' &&
      previous?.type === 'Line' &&
      previous.loc.end.line + 1 === comment.loc.start.line &&
      isOwnLine(comment, source)

    if (continues) {
      current.push(comment)
    } else {
      current = [comment]
      groups.push(current)
    }
  }

  return groups
}

function isCode(text) {
  let ast
  try {
    ast = parse(text, { filePath: 'comment.ts', allowReturnOutsideFunction: true })
  } catch {
    return false
  }

  return ast.body.some(isCodeStatement)
}

function isCodeStatement(statement) {
  if (PROSE_STATEMENTS.has(statement.type)) return false
  if (statement.type !== 'ExpressionStatement') return true

  return CODE_EXPRESSIONS.has(statement.expression.type)
}
