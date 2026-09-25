import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-explicit-any'

test('flags any in every type position', async (t) => {
  const { lines } = await lint(
    `let a: any
function f(x: any): Promise<any> {}
type T = Record<string, any>
`,
    { rule }
  )

  t.alike(lines, [1, 2, 2, 3])
})

test('unknown passes', async (t) => {
  const { lines } = await lint('function f(x: unknown): void {}\n', { rule })

  t.alike(lines, [])
})
