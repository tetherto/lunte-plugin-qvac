import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-nested-ternary'

test('flags a ternary nested anywhere in a ternary, once per chain', async (t) => {
  const { lines } = await lint(
    `const a = x ? 1 : y ? 2 : 3
const b = x ? (y ? 1 : 2) : 3
const c = (x ? y : z) ? 1 : 2
const d = a ? 1 : b ? 2 : c ? 3 : 4
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('a single ternary passes', async (t) => {
  const { lines } = await lint('const a = x ? 1 : 2\n', { rule })

  t.alike(lines, [])
})
