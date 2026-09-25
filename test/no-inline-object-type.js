import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-inline-object-type'

test('flags object types written in a signature', async (t) => {
  const { lines } = await lint(
    `function a({ id }: { id: string }) {}
function b(x: number): { ok: boolean } { return { ok: true } }
const c = async (x: string): Promise<{ n: number }> => ({ n: 1 })
class D { m(opts: { deep?: boolean } = {}) {} }
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('named types, local annotations and plain js pass', async (t) => {
  const { lines } = await lint(
    `interface Opts { id: string }
function a({ id }: Opts): Result { return run(id) }
const table: { [k: string]: number } = {}
`,
    { rule }
  )
  const js = await lint('function a({ id }) {}\n', { rule, filePath: 'lib/a.js' })

  t.alike(lines, [])
  t.alike(js.lines, [])
})
