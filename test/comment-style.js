import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/comment-style'

test('flags the second line of a comment block, once per extra line', async (t) => {
  const { lines } = await lint(
    `// first line of an explanation
// that keeps going
// and going
run()
`,
    { rule }
  )

  t.alike(lines, [2, 3])
})

test('flags block comments, dividers and long comments', async (t) => {
  const long = 'x'.repeat(101)
  const { lines } = await lint(
    `/** docs */
run()
// ----------
run()
//
run() // ${long}
// #region setup
// --- attachment/service.ts ---
`,
    { rule }
  )

  t.alike(lines, [1, 3, 5, 6, 7, 8])
})

test('one-line why comments, trailing comments and directives pass', async (t) => {
  const { lines } = await lint(
    `// the peer may be gone by now; the error is safe to drop
run()
// typeof v === 'object' is true for null too
run()
run() // offsets are in bytes
run() // and so are lengths
// lunte-disable-next-line no-undef
// the global is injected by bare
run()
/* global Pear */
/// <reference types="bare" />
`,
    { rule }
  )

  t.alike(lines, [])
})

test('a shebang is not a comment', async (t) => {
  const { lines } = await lint(
    '#!/usr/bin/env bare\n// the bin loads no engine, so --help stays fast\nrun()\n',
    {
      rule,
      filePath: 'bin/cli.mjs'
    }
  )

  t.alike(lines, [])
})
