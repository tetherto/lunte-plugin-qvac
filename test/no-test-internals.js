import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-test-internals'
const filePath = 'test/join.ts'

test('flags patching a library prototype', async (t) => {
  const { lines } = await lint(
    `import { Mesh } from '../lib/mesh.js'
Mesh.prototype.ready = async function () {}
Mesh.prototype['appendBirthOp'] = append
Object.defineProperty(Mesh.prototype, 'interrupted', { get: () => true })
`,
    { rule, filePath }
  )

  t.alike(lines, [2, 3, 4])
})

test('flags private members read or written from outside', async (t) => {
  const { lines } = await lint(
    `t.is(core._candidateMesh, null)
core._swarm = null
core['_key']
core.local?._db.get('x')
`,
    { rule, filePath }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('flags Reflect calls keyed by a private name', async (t) => {
  const { lines } = await lint(
    `Reflect.get(core, '_key')
Reflect.set(core, '_followJoinedMeshes', async () => {})
Reflect.has(core, '_swarm')
Reflect.defineProperty(core, '_open', { value: noop })
`,
    { rule, filePath }
  )

  t.alike(lines, [1, 2, 3, 4])
})

test('reports a prototype patch once, not again for its private name', async (t) => {
  const { diagnostics } = await lint('Mesh.prototype._open = open\n', { rule, filePath })

  t.is(diagnostics.length, 1)
  t.ok(diagnostics[0].message.startsWith('Do not patch a library prototype'))
})

test('the message says what to do instead', async (t) => {
  const { diagnostics } = await lint('core._swarm\n', { rule, filePath })

  t.ok(diagnostics[0].message.includes('Client and the test harness'))
  t.ok(diagnostics[0].message.includes('skip this line with a reason'))
})

test('the public surface, this, and classes the test declares pass', async (t) => {
  const { lines } = await lint(
    `await client.joinMesh(invite)
Reflect.get(core, 'opened')
Reflect.set(core, key, value)
Reflect.apply(original, this, args)
const name = core[key]
class Fake {
  _calls = 0
  call() { this._calls++ }
}
Fake.prototype.extra = noop
function Stub() {}
Stub.prototype.ready = noop
const Local = class {}
Local.prototype.ready = noop
const proto = Mesh.prototype
`,
    { rule, filePath }
  )

  t.alike(lines, [])
})

test('product code is not checked', async (t) => {
  const { lines } = await lint('Mesh.prototype.ready = noop\ncore._swarm\n', { rule })

  t.alike(lines, [])
})

test('a skip with a reason silences one line', async (t) => {
  const { lines } = await lint(
    `core._swarm // lunte-disable-line qvac/no-test-internals -- no API exposes the swarm
core._swarm
`,
    { rule, filePath }
  )

  t.alike(lines, [2])
})

test('a file-level skip silences the file', async (t) => {
  const { lines } = await lint(
    `// lunte-disable qvac/no-test-internals -- drives the TUI's private command table
app._command('/models')
Mesh.prototype.ready = noop
`,
    { rule, filePath }
  )

  t.alike(lines, [])
})
