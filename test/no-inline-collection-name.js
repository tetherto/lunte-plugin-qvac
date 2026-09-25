import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-inline-collection-name'

test('flags a collection name spelled at a db call or in a local constant', async (t) => {
  const { lines } = await lint(
    `const DEVICES = '@qvac/devices'
view.get('@qvac/agents', { id })
snap.find(DEVICES)
tx.insert('@local/files', row)
`,
    { rule }
  )

  t.alike(
    lines.sort((a, b) => a - b),
    [1, 2, 4]
  )
})

test('imports, package names, the home module and tests pass', async (t) => {
  const { lines } = await lint(
    `import { DEVICES } from './collections.ts'
import harness from '@qvac/harness'
const PKG = '@qvac/core'
view.get(DEVICES, { id })
`,
    { rule }
  )
  const home = await lint("export const DEVICES = '@qvac/devices'\nview.get('@qvac/devices')\n", {
    rule,
    filePath: 'lib/core/collections.ts'
  })
  const schema = await lint("db.collection('@qvac/devices')\n", {
    rule,
    filePath: 'schema/qvac.ts'
  })

  t.alike(lines, [])
  t.alike(home.lines, [])
  t.alike(schema.lines, [])
})
