import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/prefer-alike'

test('flags ok/absent around a comparison in tests', async (t) => {
  const { lines } = await lint(
    `t.ok(b4a.equals(a, b), 'same key')
t.ok(x === y)
t.ok(x !== y)
t.ok(!found, 'not found')
t.absent(b4a.equals(a, b))
`,
    { rule, filePath: 'test/a.ts' }
  )

  t.alike(lines, [1, 2, 3, 4, 5])
})

test('rewrites to the assertion that shows a diff', async (t) => {
  const { output } = await lint(
    "t.ok(b4a.equals(a, b), 'same key')\nt.ok(x === y)\nt.ok(!found, 'gone')\nt.absent(b4a.equals(a, b))\n",
    { rule, filePath: 'test/a.ts', fix: true }
  )

  t.is(output, "t.alike(a, b, 'same key')\nt.is(x, y)\nt.absent(found, 'gone')\nt.unlike(a, b)\n")
})

test('plain ok calls and product code pass', async (t) => {
  const inTest = await lint('t.ok(ready)\nt.ok(list.length > 0)\n', { rule, filePath: 'test/a.ts' })
  const inLib = await lint('t.ok(x === y)\n', { rule })

  t.alike(inTest.lines, [])
  t.alike(inLib.lines, [])
})
