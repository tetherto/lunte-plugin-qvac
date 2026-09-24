import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/max-function-lines'

const body = (lines) => Array.from({ length: lines }, (_, i) => `  const v${i} = ${i}`).join('\n')

test('warns on a function over 40 lines', async (t) => {
  const { diagnostics } = await lint(`function long() {\n${body(39)}\n}\n`, { rule })

  t.alike(
    diagnostics.map((d) => d.line),
    [1]
  )
  t.is(diagnostics[0].severity, 'warning')
})

test('40 lines and long test callbacks pass', async (t) => {
  const short = await lint(`function ok() {\n${body(38)}\n}\n`, { rule })
  const inTest = await lint(`test('x', () => {\n${body(60)}\n})\n`, { rule, filePath: 'test/a.ts' })

  t.alike(short.lines, [])
  t.alike(inTest.lines, [])
})
