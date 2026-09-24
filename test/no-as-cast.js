import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-as-cast'

test('flags as and angle-bracket assertions, once per chain', async (t) => {
  const { lines } = await lint(
    `const a = x as Chat
const b = <Chat>y
const c = z as unknown as Chat
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('as const and satisfies pass', async (t) => {
  const { lines } = await lint(
    `const MODES = ['a', 'b'] as const
const config = { a: 1 } satisfies Config
`,
    { rule }
  )

  t.alike(lines, [])
})

test('tests may cast', async (t) => {
  const { lines } = await lint('const a = x as Chat\n', { rule, filePath: 'test/chat.ts' })

  t.alike(lines, [])
})
