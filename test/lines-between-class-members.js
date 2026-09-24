import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/lines-between-class-members'

test('flags multi-line members with no blank line between them', async (t) => {
  const { lines } = await lint(
    `class Mesh {
  async _open() {
    await this.core.ready()
  }
  async _close() {
    await this.core.close()
  }
}
`,
    { rule }
  )

  t.alike(lines, [5])
})

test('one-line fields may sit together', async (t) => {
  const { lines } = await lint(
    `class Mesh {
  core = null
  closed = false

  async _open() {
    await this.core.ready()
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('inserts the blank line', async (t) => {
  const { output } = await lint(`class A {\n  a() {\n    x()\n  }\n  b() {}\n}\n`, {
    rule,
    fix: true
  })

  t.is(output, `class A {\n  a() {\n    x()\n  }\n\n  b() {}\n}\n`)
})
