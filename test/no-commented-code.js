import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-commented-code'

test('flags commented-out statements and calls', async (t) => {
  const { lines } = await lint(
    `// const cached = await load()
run()
// if (x) {
//   run()
// }
/* this.close() */
// await core.ready()
`,
    { rule }
  )

  t.alike(lines, [1, 3, 6, 7])
})

test('prose, single words and directives pass', async (t) => {
  const { lines } = await lint(
    `// the peer may have closed by now, so the error is safe to drop
// TODO
// note: offsets are in bytes
// see #123 for why
// lunte-disable-next-line no-undef
run()
// ready, _open and close
// @ts-expect-error older bare types
run()
`,
    { rule }
  )

  t.alike(lines, [])
})
