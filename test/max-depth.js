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
