import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-string-compare-bytes'

test('flags two byte-to-string conversions compared', async (t) => {
  const { lines } = await lint(
    `a.toString() === b.toString()
b4a.toHex(a) === b4a.toHex(b)
b4a.toString(a, 'hex') !== b4a.toString(b, 'hex')
key.toString('base64') == other.toString('base64')
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('comparing against a string id, and numbers in a radix, pass', async (t) => {
  const { lines } = await lint(
    `coreKey === b4a.toHex(mesh.key)
b4a.toHex(a) === expectedHex
n.toString(16) === m.toString(16)
b4a.equals(a, b)
`,
    { rule }
  )

  t.alike(lines, [])
})

test('a lossless comparison is rewritten to b4a.equals', async (t) => {
  const hex = await lint('ok = b4a.toHex(a) === b4a.toHex(b)\n', { rule, fix: true })
  const negated = await lint("ok = a.toString('hex') !== b.toString('hex')\n", { rule, fix: true })

  t.is(hex.output, 'ok = b4a.equals(a, b)\n')
  t.is(negated.output, 'ok = !b4a.equals(a, b)\n')
})

test('a utf8 comparison is reported but not rewritten, since equals is stricter', async (t) => {
  const { output, lines } = await lint('ok = a.toString() === b.toString()\n', { rule, fix: true })

  t.alike(lines, [1])
  t.is(output, 'ok = a.toString() === b.toString()\n')
})
