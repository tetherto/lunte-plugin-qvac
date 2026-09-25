import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/max-depth'

const nested = `function f(chats) {
  for (const chat of chats) {
    if (chat.active) {
      for (const chunk of chat.chunks) {
        if (chunk.pending) {
          retry(chunk)
        }
      }
    }
  }
}
`

test('flags the block that goes one past the max', async (t) => {
  const { lines } = await lint(nested, { rule })

  t.alike(lines, [5])
})

test('else-if chains and nested functions start no new level', async (t) => {
  const { lines } = await lint(
    `function f(a) {
  if (a === 1) {
    run()
  } else if (a === 2) {
    run()
  } else if (a === 3) {
    items.forEach((item) => {
      if (item) {
        for (const x of item) {
          if (x) run(x)
        }
      }
    })
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('the max is an option', async (t) => {
  const deeper = await lint(nested, { rule, options: [{ max: 4 }] })
  const shallower = await lint(nested, { rule, options: [{ max: 2 }] })

  t.alike(deeper.lines, [])
  t.alike(shallower.lines, [4])
})

test("warns on a closure that is only called and writes its caller's lets", async (t) => {
  const { diagnostics } = await lint(
    `function execute(events) {
  let answer = ''
  const writeText = (text) => {
    answer += text
  }
  const format = (text) => text.trim()
  const handler = (text) => {
    answer = text
  }
  events.on('text', handler)
  for (const e of events) {
    writeText(format(e.text))
  }
  return answer
}
`,
    { rule }
  )

  t.alike(
    diagnostics.map((d) => [d.line, d.severity]),
    [[3, 'warning']]
  )
})
