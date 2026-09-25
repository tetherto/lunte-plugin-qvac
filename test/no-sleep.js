import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-sleep'

test('flags promise sleeps and timers/promises', async (t) => {
  const { lines } = await lint(
    `await new Promise((resolve) => setTimeout(resolve, 100))
await new Promise((r) => { setTimeout(() => r(), 10) })
await new Promise(function (done) { globalThis.setTimeout(done, 5) })
import { setTimeout as sleep } from 'timers/promises'
import { setTimeout as wait } from 'node:timers/promises'
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3, 4, 5])
})

test('deadlines and other promises pass', async (t) => {
  const { lines } = await lint(
    `const timer = setTimeout(abort, 5000)
await new Promise((resolve) => stream.once('close', resolve))
await new Promise((resolve, reject) => setTimeout(() => reject(new Error('timeout')), 100))
`,
    { rule }
  )

  t.alike(lines, [])
})

test('tests and tooling may sleep', async (t) => {
  const source = 'await new Promise((r) => setTimeout(r, 100))\n'
  const inTest = await lint(source, { rule, filePath: 'test/chat.ts' })
  const inExample = await lint(source, { rule, filePath: 'examples/device.mjs' })

  t.alike(inTest.lines, [])
  t.alike(inExample.lines, [])
})
