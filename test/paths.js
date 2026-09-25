import test from 'brittle'

import { isTestFile, isToolingFile } from '../lib/paths.js'

test('test directories and test-named files are test files', (t) => {
  t.ok(isTestFile('test/chat.ts'))
  t.ok(isTestFile('/repo/test/helpers/mesh.ts'))
  t.ok(isTestFile('packages/core/tests/a.js'))
  t.ok(isTestFile('src/__tests__/a.tsx'))
  t.ok(isTestFile('lib/chat.test.ts'))
  t.ok(isTestFile('lib/chat.spec.mjs'))
})

test('product sources are not test files', (t) => {
  t.absent(isTestFile('lib/chat.ts'))
  t.absent(isTestFile('lib/testnet.ts'))
  t.absent(isTestFile('lib/contest/entry.js'))
  t.absent(isTestFile(undefined))
})

test('examples, scripts and benchmarks are tooling', (t) => {
  t.ok(isToolingFile('examples/mesh-lab.mjs'))
  t.ok(isToolingFile('/repo/scripts/docs-audit.cjs'))
  t.ok(isToolingFile('bench/boot.js'))
  t.absent(isToolingFile('lib/example-prompts.ts'))
  t.absent(isToolingFile('lib/core/scripts.ts'))
})
