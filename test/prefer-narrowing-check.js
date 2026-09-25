import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/prefer-narrowing-check'

test('flags Boolean() before && and a ternary that is optional chaining', async (t) => {
  const { lines } = await lint(
    `const a = Boolean(room) && !room.leftAt
const b = swarm ? swarm.dht : null
const c = swarm ? swarm.dht : undefined
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('rewrites to the narrowing form', async (t) => {
  const { output } = await lint(
    'const a = Boolean(room) && !room.leftAt\nconst b = swarm ? swarm.dht : null\n',
    { rule, fix: true }
  )

  t.is(output, 'const a = !!(room) && !room.leftAt\nconst b = swarm?.dht ?? null\n')
})

test('other ternaries and Boolean() elsewhere pass', async (t) => {
  const { lines } = await lint(
    `const a = Boolean(x)
const b = x ? y.z : null
const c = x ? x.y : fallback
`,
    { rule }
  )

  t.alike(lines, [])
})
