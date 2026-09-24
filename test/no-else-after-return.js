import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-else-after-return'

test('flags an else after an if that returns or throws', async (t) => {
  const { lines } = await lint(
    `function f(device) {
  if (!device) {
    return null
  } else {
    return device.name
  }
}
function g(x) {
  if (x) throw new Error('x')
  else run()
}
`,
    { rule }
  )

  t.alike(lines, [4, 10])
})

test('an if that falls through, and else-if chains, pass', async (t) => {
  const { lines } = await lint(
    `function f(a) {
  if (a) {
    run()
  } else {
    other()
  }
  if (a === 1) {
    return 1
  } else if (a === 2) {
    return 2
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('unwraps the else body', async (t) => {
  const { output } = await lint(
    `function f(device) {
  if (!device) {
    return null
  } else {
    return device.name
  }
}
`,
    { rule, fix: true }
  )

  t.ok(!output.includes('else'))
  t.ok(output.includes('return device.name'))
})
