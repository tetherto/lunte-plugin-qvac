export function walk(node, visit, parent = null) {
  if (!isNode(node)) return

  visit(node, parent)
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc') continue
    const children = Array.isArray(value) ? value : [value]
    for (const child of children) {
      walk(child, visit, node)
    }
  }
}

export function isNode(value) {
  return typeof value?.type === 'string'
}

export function sourceOf(context, node) {
  return context.source.slice(node.start, node.end)
}
