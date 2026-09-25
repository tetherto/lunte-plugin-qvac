import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-init-method'

test('flags init methods and functions', async (t) => {
  const { lines } = await lint(
    `class A {
  async init() {}
}
const b = { init() {} }
const c = { init: async () => {} }
function init() {}
`,
    { rule }
  )

  t.alike(lines, [2, 4, 5, 6])
})

test('ready, _open and an init value pass', async (t) => {
  const { lines } = await lint(
    `class A {
  async _open() {}
  initialise = true
}
const b = { init: 1, [init]() {} }
`,
    { rule }
  )

  t.alike(lines, [])
})
