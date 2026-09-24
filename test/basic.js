const { test } = require('brittle')
const Hello = require('..')

test('works', async (t) => {
  const h = new Hello()
  t.is(h.world, 'world')
})
