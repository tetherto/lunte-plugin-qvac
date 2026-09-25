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
  run(x)
}
for (const x of xs) {
  if (!x) continue
  run(x)
}
async function g() {
  if (!this.opened) await this.ready()
  if (!x) return
  run()
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
  if (x) run(1)
  else run(2)
}
`,
    { rule, fix: true }
  )

  t.is(
    output,
    `function f(x) {
  run()
  if (x) { run(1) }
  else { run(2) }
}
`
  )
})

test('a guard over the length limit needs braces', async (t) => {
  const long = `function f(x) {\n  if (!x.someRatherLongPropertyName || !x.anotherLongPropertyName) return x.cached\n  run()\n}\n`
  const { lines } = await lint(long, { rule })

  t.alike(lines, [2])
})

test('only the first two one-line guards may skip braces', async (t) => {
  const { lines } = await lint(
    `function f(x) {
  if (!x) return
  if (x.closed) return null
  if (x.skip) return false
  run(x)
}
`,
    { rule }
  )

  t.alike(lines, [4])
})

test('a guard that computes what it returns needs braces', async (t) => {
  const { lines } = await lint(
    `function f(x) {
  if (!x) return computeFallback(x)
  if (x.a) throw new Error(explain(x))
  run(x)
}
function g(x) {
  if (!x) return FALLBACK
  if (x.b) return []
  run(x)
}
function h(x) {
  if (x.c) return this.cache.value
  if (x.d) throw new Error(\`bad \${x.name}\`)
  run(x)
}
`,
    { rule }
  )

  t.alike(lines, [2, 3])
})

test('the limits are options', async (t) => {
  const source = `function f(x) {\n  if (!x) return\n  if (x.a) return\n  if (x.b) return\n  run(x)\n}\n`
  const looser = await lint(source, { rule, options: [{ maxGuards: 3 }] })
  const strict = await lint(source, { rule, options: [{ maxGuards: 0 }] })

  t.alike(looser.lines, [])
  t.alike(strict.lines, [2, 3, 4])
})
