import { parse } from 'lunte/src/core/parser.js'

const DIRECTIVE =
  /^\s*(lunte-|eslint-|eslint |globals? |@ts-|prettier-ignore|c8 |istanbul |[#@]__PURE__|\/\s*<reference)/

let last = null

// lunte does not hand comments to rules yet, so re-parse once per file for them
export function getComments(context) {
  if (context.comments) return context.comments
  if (context.filePath?.endsWith('.json')) return []
  if (last?.filePath === context.filePath && last.source === context.source) return last.comments

  const found = []
  parse(context.source, { filePath: context.filePath, onComment: found })
  const comments = found.filter((comment) => !isHashbang(comment, context.source))
  last = { filePath: context.filePath, source: context.source, comments }

  return comments
}

export function isDirective(comment) {
  return DIRECTIVE.test(comment.value)
}

export function isOwnLine(comment, source) {
  const lineStart = source.lastIndexOf('\n', comment.start - 1) + 1
  return source.slice(lineStart, comment.start).trim() === ''
}

function isHashbang(comment, source) {
  return comment.start === 0 && source.startsWith('#!')
}
