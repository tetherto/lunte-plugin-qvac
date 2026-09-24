import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-utils-file'

test('flags grab-bag file names', async (t) => {
  for (const filePath of ['lib/utils.ts', 'lib/core/helpers.js', 'src/util.mjs', 'lib/misc.tsx']) {
    const { lines } = await lint('export const a = 1\n', { rule, filePath })
    t.alike(lines, [1], filePath)
  }
})

test('domain names and test helpers pass', async (t) => {
  for (const filePath of [
    'lib/chat-utils-bridge.ts',
    'lib/blobs.ts',
    'test/helpers.ts',
    'test/helpers/mesh.ts'
  ]) {
    const { lines } = await lint('export const a = 1\n', { rule, filePath })
    t.alike(lines, [], filePath)
  }
})
