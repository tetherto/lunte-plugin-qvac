import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/padding-lines'

test('flags a statement right after a multi-line block', async (t) => {
  const { lines } = await lint(
    `if (a) {
  run()
}
next()
for (const x of xs) {
  run(x)
}
// why the next call matters
next()
`,
    { rule }
  )

  t.alike(lines, [4, 9])
})

test('flags a closing return after a multi-line statement in a longer block', async (t) => {
  const { lines } = await lint(
    `function f() {
  const a = build({
    x: 1
  })
  const b = 2
  return a + b
}
function g() {
  const a = 1
  const b = 2
  return a + b
}
function kind(n) {
  if (n < 0) return 'neg'
  if (n === 0) return 'zero'
  return 'pos'
}
`,
    { rule }
  )

  t.alike(lines, [6])
})

test('one-line blocks, grouped code and else chains pass', async (t) => {
  const { lines } = await lint(
    `if (a) run()
next()
if (a) {
  run()
} else {
  other()
}

next()
function f() {
  if (!x) return
  return x
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('inserts the blank line after the block, before its comment', async (t) => {
  const { output } = await lint(
    `if (a) {
  run()
}
// why
next()
`,
    { rule, fix: true }
  )

  t.is(output, `if (a) {\n  run()\n}\n\n// why\nnext()\n`)
})
