import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/ready-guard'

test('flags a bare await this.ready()', async (t) => {
  const { lines } = await lint(
    `class A {
  async get(key) {
    await this.ready()
    return this.db.get(key)
  }
}
`,
    { rule }
  )
  const fixed = await lint('async function f() {\n  await this.ready()\n}\n', { rule, fix: true })

  t.alike(lines, [3])
  t.is(fixed.output, 'async function f() {\n  if (!this.opened) await this.ready()\n}\n')
})

test('the guarded form passes, braced or not', async (t) => {
  const { lines } = await lint(
    `class A {
  async get(key) {
    if (!this.opened) await this.ready()
    return this.db.get(key)
  }
  async put(key) {
    if (!this.opened) {
      await this.ready()
    }
  }
  async other() {
    await other.ready()
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})
