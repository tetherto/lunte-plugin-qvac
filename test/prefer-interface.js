import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/prefer-interface'

test('flags a type alias for an object shape', async (t) => {
  const { lines } = await lint(
    `type A = { a: string }
export type B<T> = { b: T }
type C = string | number
type D = Record<string, unknown>
type E = { a: 1 } & { b: 2 }
`,
    { rule }
  )

  t.alike(lines, [1, 2])
})

test('rewrites the alias as an interface', async (t) => {
  const { output } = await lint(
    'export type B<T = string> = { b: T }\ndeclare type C = { c: number };\n',
    {
      rule,
      fix: true
    }
  )

  t.is(output, 'export interface B<T = string> { b: T }\ndeclare interface C { c: number }\n')
})
