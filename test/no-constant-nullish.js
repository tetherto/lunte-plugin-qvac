import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-constant-nullish'

test('flags ?? after a never-nullish value and === true on a boolean', async (t) => {
  const { lines } = await lint(
    `const a = (!!x && b4a.equals(x, y)) ?? false
const b = (!!x && b4a.equals(x, y)) !== true
const c = (n > 1) ?? 0
const d = !ok === false
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('values that may be nullish pass', async (t) => {
  const { lines } = await lint(
    `const a = x ?? false
const b = map.get(k) ?? []
const c = x?.ok === true
const d = (a && b) ?? c
`,
    { rule }
  )

  t.alike(lines, [])
})

test('drops the dead half', async (t) => {
  const { output } = await lint(
    'const a = (!!x && b4a.equals(x, y)) ?? false\nconst b = !x !== true\n',
    {
      rule,
      fix: true
    }
  )

  t.is(output, 'const a = !!x && b4a.equals(x, y)\nconst b = !(!x)\n')
})
