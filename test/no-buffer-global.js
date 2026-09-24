import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-buffer-global'

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
