import { getComments, isDirective, isOwnLine } from '../comments.js'

const MAX_LENGTH = 100
const DIVIDER = /^[\s\-=*#~_/+<>|]*$|[-=*#~_]{3,}|#(end)?region\b|\bMARK:/

export const commentStyle = {
  meta: {
    name: 'qvac/comment-style',
    description: 'Comments are one short line that says why.'
  },
  create(context) {
    return {
      Program() {
        let previous = null

        for (const comment of getComments(context)) {
          if (isDirective(comment)) {
            previous = null
            continue
          }

          const message = check(comment, previous, context.source)
          if (message) {
            context.report({ node: comment, message })
          }

          previous = comment
        }
      }
    }
  }
}

function check(comment, previous, source) {
  if (comment.type === 'Block') {
    return 'No comment blocks; use a single // line that says why.'
  }

  const text = comment.value.trim()
  if (DIVIDER.test(text)) {
    return 'No empty or divider comments; blank lines group the code.'
  }

  if (text.length > MAX_LENGTH) {
    return `Comment is ${text.length} characters; keep it under ${MAX_LENGTH}.`
  }

  if (continuesBlock(comment, previous, source)) {
    return 'Comments are one line; if one line cannot carry it, reshape the code.'
  }

  return null
}

function continuesBlock(comment, previous, source) {
  return (
    previous?.type === 'Line' &&
    previous.loc.end.line + 1 === comment.loc.start.line &&
    isOwnLine(previous, source) &&
    isOwnLine(comment, source)
  )
}
