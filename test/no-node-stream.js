import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-node-stream'

test('flags the Node stream module', async (t) => {
  const { lines } = await lint(
    `import { Readable } from 'stream'
import { pipeline } from 'node:stream/promises'
const { Transform } = require('stream')
`,
    { rule, filePath: 'lib/a.js' }
  )

  t.alike(lines, [1, 2, 3])
})

test('streamx and type-only imports pass', async (t) => {
  const { lines } = await lint(
    "import { Readable } from 'streamx'\nimport type { Duplex } from 'node:stream'\n",
    { rule }
  )

  t.alike(lines, [])
})
