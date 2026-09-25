import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-hand-rolled-guard'

test('flags hand-written isRecord and error-message guards', async (t) => {
  const { lines } = await lint(
    `const isRecord = (v) => typeof v === 'object' && v !== null
const ok = v !== null && typeof v === 'object'
const message = err instanceof Error ? err.message : String(err)
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('the home module and unrelated checks pass', async (t) => {
  const home = await lint("export const isRecord = (v) => typeof v === 'object' && v !== null\n", {
    rule,
    filePath: 'lib/guards.ts'
  })
  const other = await lint("const a = typeof v === 'string' && v !== ''\n", { rule })

  t.alike(home.lines, [])
  t.alike(other.lines, [])
})
