import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-default-export'

test('flags a default export in product code', async (t) => {
  const { lines } = await lint('export default class Chat {}\n', { rule })

  t.alike(lines, [1])
})

test('named exports, tests, tooling, declarations and config files pass', async (t) => {
  const named = await lint('export class Chat {}\n', { rule })
  const skipped = await Promise.all(
    ['test/a.ts', 'examples/a.mjs', 'types/bare.d.ts', 'vite.config.ts'].map((filePath) =>
      lint('export default {}\n', { rule, filePath })
    )
  )

  t.alike(named.lines, [])
  t.alike(
    skipped.map((result) => result.lines),
    [[], [], [], []]
  )
})
