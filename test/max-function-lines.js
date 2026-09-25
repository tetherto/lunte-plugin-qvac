import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/max-function-lines'

const body = (lines) => Array.from({ length: lines }, (_, i) => `  const v${i} = ${i}`).join('\n')

test('flags a function over 40 lines, as an error by default', async (t) => {
  const { diagnostics } = await lint(`function long() {\n${body(39)}\n}\n`, { rule })

  t.alike(
    diagnostics.map((d) => d.line),
    [1]
  )
  t.is(diagnostics[0].severity, 'error')
})

test('the max is an option', async (t) => {
  const source = `function long() {\n${body(39)}\n}\n`
  const looser = await lint(source, { rule, options: [{ max: 60 }] })
  const stricter = await lint(`function f() {\n${body(20)}\n}\n`, { rule, options: [{ max: 20 }] })

  t.alike(looser.lines, [])
  t.alike(stricter.lines, [1])
})

test('40 lines and long test callbacks pass', async (t) => {
  const short = await lint(`function ok() {\n${body(38)}\n}\n`, { rule })
  const inTest = await lint(`test('x', () => {\n${body(60)}\n})\n`, { rule, filePath: 'test/a.ts' })

  t.alike(short.lines, [])
  t.alike(inTest.lines, [])
})
