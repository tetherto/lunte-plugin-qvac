import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-catch-fabricate'

test('flags inline closures that do what noop does', async (t) => {
  const { lines } = await lint(
    `const a = p.catch(() => {})
const b = p.catch(() => undefined)
const c = p.catch(function () {})
const d = p.catch(() => void 0)
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('flags a fabricated value nobody reads', async (t) => {
  const { lines } = await lint(
    `p.catch(() => null)
await p.catch(() => false)
void p.catch((err) => ({}))
it.return?.().catch(() => [])
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('a fallback the caller reads, noop and real handlers pass', async (t) => {
  const { lines } = await lint(
    `const text = await response.text().catch(() => '')
if (await allowed(key).catch(() => false)) run()
const rows = (await list().catch(() => [])) ?? []
p.catch(noop)
p.catch(safetyCatch)
p.catch((err) => this.emit('error', err))
function noop() {}
`,
    { rule }
  )

  t.alike(lines, [])
})
