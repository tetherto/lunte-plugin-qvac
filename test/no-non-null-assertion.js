import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-non-null-assertion'

test('flags ! assertions and definite assignments', async (t) => {
  const { lines } = await lint(
    `const id = this._deviceId!
let final!: Frame
class A { key!: Buffer }
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('narrowed values, negation and tests pass', async (t) => {
  const { lines } = await lint('if (id) use(id)\nconst ok = !x\n', { rule })
  const inTest = await lint('const id = this._deviceId!\n', { rule, filePath: 'test/a.ts' })

  t.alike(lines, [])
  t.alike(inTest.lines, [])
})
