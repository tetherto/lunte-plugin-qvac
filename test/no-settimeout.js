import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-settimeout'

test('warns on timers in product code', async (t) => {
  const { diagnostics } = await lint(
    `const a = setTimeout(flush, 100)
const b = setInterval(poll, 1000)
globalThis.setTimeout(flush, 0)
clearTimeout(a)
`,
    { rule }
  )

  t.alike(
    diagnostics.map((d) => d.line),
    [1, 2, 3]
  )
  t.ok(diagnostics.every((d) => d.severity === 'warning'))
})

test('tests and tooling may use timers', async (t) => {
  const inTest = await lint('setTimeout(done, 10)\n', { rule, filePath: 'test/a.ts' })
  const inScript = await lint('setTimeout(done, 10)\n', { rule, filePath: 'scripts/boot.mjs' })

  t.alike(inTest.lines, [])
  t.alike(inScript.lines, [])
})
