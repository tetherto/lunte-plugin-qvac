import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/prefer-for-await'

test('flags loops that drain an iterator they just opened', async (t) => {
  const { lines } = await lint(
    `async function a(stream) {
  const it = stream[Symbol.asyncIterator]()
  while (true) {
    const { value, done } = await it.next()
    if (done) break
    use(value)
  }
}
async function b(stream) {
  const it = stream[Symbol.asyncIterator]()
  let next = await it.next()
  while (!next.done) {
    use(next.value)
    next = await it.next()
  }
}
async function c(stream) {
  const it = stream[Symbol.asyncIterator]()
  while (true) {
    const { value, done } = await it.next()
    if (done || this._closed) return
    for (const x of value) {
      if (!x) continue
      if (x.last) break
    }
  }
}
`,
    { rule }
  )

  t.alike(lines, [3, 12, 19])
})

test('loops that stop early keep the iterator open and pass', async (t) => {
  const { lines } = await lint(
    `async function waitFor(stream, done) {
  const frames = stream[Symbol.asyncIterator]()
  while (true) {
    const { value } = await frames.next()
    if (done(value)) return value
  }
}
async function head(stream, n) {
  const it = stream[Symbol.asyncIterator]()
  let collected = 0
  while (collected < n) {
    const next = await it.next()
    if (next.done) break
    collected += next.value.length
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})

test('an iterator that arrived already started passes', async (t) => {
  const { lines } = await lint(
    `async function* rest(it) {
  let next = await it.next()
  while (!next.done) {
    yield next.value
    next = await it.next()
  }
}
async function kept(stream) {
  const it = stream[Symbol.asyncIterator]()
  this._iterator = it
  while (true) {
    const { done } = await it.next()
    if (done) return
  }
}
async function member() {
  this._stream = this.engine.watch({})[Symbol.asyncIterator]()
  while (true) {
    const { done } = await this._stream.next()
    if (done) return
  }
}
async function drain(stream) {
  const it = stream[Symbol.asyncIterator]()
  const first = await it.next()
  while (true) {
    if ((await it.next()).done) return first
  }
}
`,
    { rule }
  )

  t.alike(lines, [])
})
