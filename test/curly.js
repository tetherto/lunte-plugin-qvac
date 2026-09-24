import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/curly'

test('guard clauses at the top of a function or loop may stay one line', async (t) => {
  const { lines } = await lint(
    `function f(x) {
  if (!x) return
  if (x.closed) throw new Error('closed')
  if (x.skip) {
    return
  }
  if (x.done) return null
  run(x)
}
for (const x of xs) {
  if (!x) continue
  run(x)
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('one-line ifs after other statements, with else, or doing work need braces', async (t) => {
  const { lines } = await lint(
    `function f(x) {
  const y = x.y
  if (!y) return
  if (y.a) run(y)
  if (y.b) return 1
  else return 2
}
for (const x of xs) run(x)
while (more) pull()
`,
    { rule }
  )

  t.alike(lines, [3, 4, 5, 6, 8, 9])
})

test('wraps the body in braces', async (t) => {
  const { output } = await lint(
    `function f(x) {
  run()
  if (x) return 1
  else return 2
}
`,
    { rule, fix: true }
  )

  t.is(
    output,
    `function f(x) {
  run()
  if (x) { return 1 }
  else { return 2 }
}
`
  )
})
