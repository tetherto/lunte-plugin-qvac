import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/max-params'

test('flags functions with more than three positional parameters', async (t) => {
  const { lines } = await lint(
    `function a(w, x, y, z) {}
const b = (w, x, y, z) => {}
class C { m(w, x, y, z) {} }
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('three parameters, an options object and a this parameter pass', async (t) => {
  const { lines } = await lint(
    `function a(x, y, z) {}
function b(store, { signal, limit, offset, deep }) {}
function c(this: Thing, x: number, y: number, z: number) {}
`,
    { rule }
  )

  t.alike(lines, [])
})
