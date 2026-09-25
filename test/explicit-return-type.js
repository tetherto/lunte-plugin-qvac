import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/explicit-return-type'

test('flags exported functions without a return type', async (t) => {
  const { lines } = await lint(
    `export function a(x) { return x }
export const b = (x: number) => x
export const c = async function () {}
export default function () {}
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('typed, internal, annotated-variable and non-ts functions pass', async (t) => {
  const { lines } = await lint(
    `export function a(x: number): number { return x }
export const b = (x: number): number => x
export const c: Handler = () => {}
function internal(x) { return x }
`,
    { rule }
  )
  const js = await lint('export function a(x) { return x }\n', { rule, filePath: 'lib/a.mjs' })

  t.alike(lines, [])
  t.alike(js.lines, [])
})
