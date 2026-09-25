import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/prefer-b4a'

test('flags every runtime use of the Buffer global', async (t) => {
  const { lines } = await lint(
    `const a = Buffer.from('hi')
const b = Buffer.alloc(4)
const c = new Buffer(4)
const d = Buffer.isBuffer(a)
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('b4a and Buffer as a type pass', async (t) => {
  const { lines } = await lint(
    `import b4a from 'b4a'
const a: Buffer = b4a.from('hi')
function f(x: Buffer | Uint8Array): Buffer { return b4a.from(x) }
`,
    { rule }
  )

  t.alike(lines, [])
})

test('flags Buffer methods b4a replaces, and the buffer module', async (t) => {
  const { lines } = await lint(
    `const a = key.toString('hex')
const b = id.equals(other)
const c = blob.readUInt32LE(0)
const d = x.compare(y)
import { Buffer } from 'buffer'
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4, 5])
})

test('lookalikes without a b4a equivalent pass', async (t) => {
  const { lines } = await lint(
    `const a = n.toString(16)
const b = obj.toString()
const c = blob.readUInt16LE(0)
const d = collator.compare(a, b)
const e = b4a.readUInt32LE(buf, 0)
b4a.writeUInt32LE(buf, 1, 0)
`,
    { rule }
  )

  t.alike(lines, [])
})

test("b4a.toString(buf, 'hex') becomes b4a.toHex(buf)", async (t) => {
  const { lines } = await lint(
    "const a = b4a.toString(key, 'hex')\nconst b = b4a.toString(key, 'base64')\n",
    {
      rule
    }
  )
  const { output } = await lint("const a = b4a.toString(key, 'hex')\n", { rule, fix: true })

  t.alike(lines, [1])
  t.is(output, 'const a = b4a.toHex(key)\n')
})
