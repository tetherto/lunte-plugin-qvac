import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-conditional-spread'

test('flags a ternary or && spread of an optional field', async (t) => {
  const { lines } = await lint(
    `const a = { ...(signal ? { signal } : {}) }
const b = { ...(signal ? {} : { fallback: 1 }) }
const c = { ...(signal && { signal }) }
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('plain fields and unconditional spreads pass', async (t) => {
  const { lines } = await lint(
    `const a = { signal }
const b = { ...defaults, ...opts }
const c = { ...(big ? large : small) }
const d = [...(list ? list : [])]
`,
    { rule }
  )

  t.alike(lines, [])
})
