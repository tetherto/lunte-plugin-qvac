# lunte-plugin-qvac

Lunte rules for the QVAC house style.

## Installation

```sh
npm i -D lunte lunte-plugin-qvac
```

## Usage

Add the plugin to `.lunterc.json`. Every rule is on once the plugin loads.

```json
{
  "plugins": ["lunte-plugin-qvac"]
}
```

Turn a rule off or down the same way as a built-in one:

```json
{
  "plugins": ["lunte-plugin-qvac"],
  "rules": { "qvac/max-function-lines": "warn" }
}
```

`qvac/max-function-lines`, `qvac/max-depth` and `qvac/curly` take options. They read them from
`context.options`, in the ESLint shape, so once lunte passes rule options they are set like this; until
then the defaults apply:

```json
{
  "rules": {
    "qvac/max-function-lines": ["error", { "max": 60 }],
    "qvac/max-depth": ["error", { "max": 4 }],
    "qvac/curly": ["error", { "maxGuards": 1, "maxLength": 100 }]
  }
}
```

Rules that only make sense in product code skip test files: anything under a `test/`, `tests/` or
`__tests__/` directory, and `*.test.*` / `*.spec.*` files.

The timer rules also skip tooling under `examples/`, `scripts/` and `bench/`, which drives real
devices and external processes.

## Rules

| Rule                                                                   | What it enforces                                                                                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`qvac/no-conditional-spread`](#qvacno-conditional-spread)             | No `...(x ? { x } : {})`; assign the field and let `undefined` propagate.                                                                      |
| [`qvac/no-catch-fabricate`](#qvacno-catch-fabricate)                   | `.catch(noop)` instead of an inline `() => {}`, or a fallback value nobody reads.                                                              |
| [`qvac/prefer-for-await`](#qvacprefer-for-await)                       | `for await` for a loop that opens an iterator and drains it with `it.next()`.                                                                  |
| [`qvac/no-sleep`](#qvacno-sleep)                                       | No `new Promise((r) => setTimeout(r, ms))` sleeps outside tests and tooling.                                                                   |
| [`qvac/no-settimeout`](#qvacno-settimeout)                             | Warns on every `setTimeout` / `setInterval` outside tests and tooling.                                                                         |
| [`qvac/prefer-b4a`](#qvacprefer-b4a)                                   | `b4a` instead of the `Buffer` global, the `buffer` module, or Buffer methods b4a has a function for; `b4a.toHex` for hex. Autofix for `toHex`. |
| [`qvac/no-string-compare-bytes`](#qvacno-string-compare-bytes)         | `b4a.equals(a, b)`, not two buffers compared as strings. Autofix when the encoding is lossless.                                                |
| [`qvac/no-explicit-any`](#qvacno-explicit-any)                         | No `any`.                                                                                                                                      |
| [`qvac/no-as-cast`](#qvacno-as-cast)                                   | No `as` / `<T>` assertions in product code; `as const` is fine.                                                                                |
| [`qvac/no-init-method`](#qvacno-init-method)                           | No `init()`; that is `ready()`.                                                                                                                |
| [`qvac/no-utils-file`](#qvacno-utils-file)                             | No `utils` / `helpers` / `misc` / `common` files in product code.                                                                              |
| [`qvac/no-positional-boolean`](#qvacno-positional-boolean)             | No `true` / `false` literal among several call arguments in product code.                                                                      |
| [`qvac/max-params`](#qvacmax-params)                                   | At most three positional parameters.                                                                                                           |
| [`qvac/no-nested-ternary`](#qvacno-nested-ternary)                     | No ternary inside a ternary.                                                                                                                   |
| [`qvac/max-function-lines`](#qvacmax-function-lines)                   | Functions stay under `max` lines (default 40), outside tests.                                                                                  |
| [`qvac/no-commented-code`](#qvacno-commented-code)                     | No commented-out code.                                                                                                                         |
| [`qvac/comment-style`](#qvaccomment-style)                             | Comments are one `//` line under 100 characters: no blocks, no dividers.                                                                       |
| [`qvac/curly`](#qvaccurly)                                             | Braces everywhere except a short one-line guard clause at the top of a function or loop (options: `maxGuards`, `maxLength`). Autofix.          |
| [`qvac/padding-lines`](#qvacpadding-lines)                             | A blank line after a multi-line block and before the closing `return` of a longer block. Autofix.                                              |
| [`qvac/ready-guard`](#qvacready-guard)                                 | `if (!this.opened) await this.ready()` instead of a bare `await this.ready()`. Autofix.                                                        |
| [`qvac/no-node-stream`](#qvacno-node-stream)                           | `streamx` instead of Node's `stream` module.                                                                                                   |
| [`qvac/max-depth`](#qvacmax-depth)                                     | Blocks nest at most `max` deep (default 3); `else if` and nested functions start over.                                                         |
| [`qvac/no-else-after-return`](#qvacno-else-after-return)               | No `else` after an `if` that returns or throws. Autofix.                                                                                       |
| [`qvac/lines-between-class-members`](#qvaclines-between-class-members) | A blank line between class members when either spans several lines. Autofix.                                                                   |
| [`qvac/no-default-export`](#qvacno-default-export)                     | Named exports in product code; `.d.ts` and `*.config.*` files are exempt.                                                                      |
| [`qvac/explicit-return-type`](#qvacexplicit-return-type)               | Exported TypeScript functions declare their return type.                                                                                       |
| [`qvac/no-inline-object-type`](#qvacno-inline-object-type)             | Object types in a function signature get a name (an interface).                                                                                |
| [`qvac/prefer-interface`](#qvacprefer-interface)                       | `interface X { … }`, not `type X = { … }`, for an object shape. Autofix.                                                                       |
| [`qvac/no-non-null-assertion`](#qvacno-non-null-assertion)             | No `x!` or `let x!: T` outside tests.                                                                                                          |

## Rule details

### qvac/no-conditional-spread

An absent key and a key set to `undefined` behave the same for every consumer that matters, so the
spread only adds a branch.

```js
const opts = { ...(signal ? { signal } : {}) } // flagged
const opts = { ...(speak ? { speak } : null) } // flagged: null is the same empty branch
const opts = { signal } // ok
```

### qvac/no-catch-fabricate

A swallowed rejection uses the file's `noop`. A fallback value the caller actually reads is fine.

```js
p.catch(() => {}) // flagged
p.catch(noop) // ok
const text = await res.text().catch(() => '') // ok: the '' is read
```

### qvac/prefer-for-await

A loop that opens an iterator and drains it to the end is what `for await` says. Loops that stop
early or keep the iterator (for teardown or a later loop) are left alone, because `for await` would
close it.

```js
// flagged
const it = stream[Symbol.asyncIterator]()
while (true) {
  const { value, done } = await it.next()
  if (done) break
  use(value)
}

// ok
for await (const value of stream) use(value)
```

### qvac/no-sleep

Waiting a fixed time is a race you decided to ship. Wait on the event or promise that knows.

```js
await new Promise((resolve) => setTimeout(resolve, 100)) // flagged
await once(stream, 'open') // ok
```

### qvac/no-settimeout

Warns on every timer in product code. Deadlines and debounces are fine, but each one is worth a
look.

```js
const timer = setTimeout(flush, 100) // warning
```

### qvac/prefer-b4a

`b4a` works the same on Node and Bare; the `Buffer` global and its methods are Node's.

```js
Buffer.from('hi') // flagged
key.toString('hex') // flagged
a.equals(b) // flagged
import { Buffer } from 'buffer' // flagged

b4a.toString(key, 'hex') // flagged: say toHex, autofix
b4a.from('hi') // ok
b4a.toHex(key) // ok
b4a.equals(a, b) // ok
```

### qvac/no-string-compare-bytes

Turning two buffers into strings to compare them allocates twice, and utf8 decodes every invalid byte
to the same character, so different bytes can compare equal. Comparing a buffer against an id that is
already a string is fine. The fix rewrites hex, base64 and latin1 comparisons; utf8 ones are only
reported, because `b4a.equals` is stricter there.

```js
a.toString() === b.toString() // flagged
b4a.toHex(a) === b4a.toHex(b) // flagged, autofix
b4a.equals(a, b) // ok
coreKey === b4a.toHex(mesh.key) // ok: coreKey is already hex
```

### qvac/no-explicit-any

A value of unknown shape is `unknown`, narrowed at the boundary.

```ts
function parse(raw: any) {} // flagged
function parse(raw: unknown) {} // ok
```

### qvac/no-as-cast

A cast tells the compiler to stop helping. Parse untrusted data (with Zod or a type guard) and let
the type follow. `as const` and test files are exempt.

```ts
const config = JSON.parse(text) as Config // flagged
const config = ConfigSchema.parse(JSON.parse(text)) // ok
```

### qvac/no-init-method

Async setup is `ready()` through ready-resource's `_open()`; an `init()` reimplements it.

```js
class Store {
  async init() {} // flagged
  async _open() {} // ok
}
```

### qvac/no-utils-file

A `utils` or `helpers` file is a grab bag. Name each file for the domain it holds.

```
lib/utils.ts     // flagged
lib/pkce.ts      // ok
```

### qvac/no-positional-boolean

`render(node, true, false)` is unreadable where it is called. Value setters like `map.set(k, true)`
are allowed.

```js
render(node, true, false) // flagged
render(node, { deep: true, cached: false }) // ok
```

### qvac/max-params

Keep one or two subjects positional and pass the rest by name; swapping two same-typed positional
arguments still compiles.

```js
frame(update, src, i, total) // flagged
frame(update, { src, fileIndex: i, totalFiles: total }) // ok
```

### qvac/no-nested-ternary

```js
const label = a ? 'x' : b ? 'y' : 'z' // flagged

// ok: an if/else, an early return, or a lookup
const LABELS = { a: 'x', b: 'y' }
const label = LABELS[kind] ?? 'z'
```

### qvac/max-function-lines

A function you can't hold in your head has a second responsibility inside it. Default `max` is 40;
tests are exempt.

```js
function boot() {
  // 41 or more lines: flagged
}
```

### qvac/no-commented-code

Git remembers deleted code.

```js
// const cached = await load() // flagged
// the peer may be gone by now, so the error is safe to drop // ok
```

### qvac/comment-style

A comment is one `//` line under 100 characters that says why. If one line can't carry it, the code
needs reshaping or the reason belongs in a decision record.

```js
// flagged: a block
// that keeps going

/** flagged: JSDoc */
// ---------- flagged: a divider

// ok: the peer may be gone by now, so the error is safe to drop
```

### qvac/curly

Braces everywhere. The one exception is a short guard clause at the top of a function or loop:
`if (…) return|throw|continue|break` or `if (!this.opened) await this.ready()`. It stays one line
only when:

- it is one of the first `maxGuards` (default 2) one-line guards in the block;
- its line fits in `maxLength` (default 80) characters;
- what it returns or throws is plain: nothing, a literal, a name, a property, `[]` or `{}`, or
  `new Error('…')`.

`maxGuards: 0` means braces on every `if`. The fix adds the braces.

```js
function f(x) {
  if (!x) return FALLBACK // ok: a short leading guard with a plain value
  if (!this.opened) await this.ready() // ok
  if (x.closed) return null // flagged: the third guard
}

function g(x) {
  if (!x) return computeFallback(x) // flagged: the guard computes its answer
  const y = x.y
  if (!y) return // flagged: not at the top
  for (const z of y) run(z) // flagged: loops always take braces
}
```

### qvac/padding-lines

A blank line after a multi-line block, and before the closing `return` of a block with three or
more statements when one of them spans several lines. A run of one-line statements, like an
if-return ladder, stays together with its return.

```js
// flagged
if (a) {
  run()
}
next()

// ok
if (a) {
  run()
}

next()
```

### qvac/ready-guard

A bare `await this.ready()` costs a microtask on every call, even once the resource is open.

```js
async get(key) {
  await this.ready() // flagged
  if (!this.opened) await this.ready() // ok
}
```

### qvac/no-node-stream

`streamx` is lighter and runs on Bare. A type-only import is fine.

```js
import { Readable } from 'stream' // flagged
import { Readable } from 'streamx' // ok
import type { Duplex } from 'node:stream' // ok: loads nothing
```

### qvac/max-depth

Past `max` levels (default 3) the code wants an early return or a helper. `else if` and nested
functions start over. Moving the nesting into a closure that is only called and writes the caller's
`let`s hides it rather than removing it, so that is reported as a warning: return the value instead.

```js
// flagged: the fourth level
for (const chat of chats) {
  if (chat.active) {
    for (const chunk of chat.chunks) {
      if (chunk.pending) retry(chunk)
    }
  }
}

// ok
for (const chat of chats) {
  if (!chat.active) continue
  retryPending(chat.chunks)
}
```

### qvac/no-else-after-return

When the `if` returns, the `else` is only indentation.

```js
// flagged
if (!device) {
  return null
} else {
  return device.name
}

// ok
if (!device) return null

return device.name
```

### qvac/lines-between-class-members

A blank line between class members when either spans several lines. One-line fields may sit
together.

```js
class Mesh {
  core = null
  closed = false // ok: one-line fields

  async _open() {
    await this.core.ready()
  }
  async _close() {} // flagged: needs a blank line above
}
```

### qvac/no-default-export

Named exports keep the name the same at every import. `.d.ts` and `*.config.*` files, tests and
tooling are exempt.

```js
export default class Chat {} // flagged
export class Chat {} // ok
```

### qvac/explicit-return-type

An exported function's signature is its contract, so it shouldn't depend on inference.

```ts
export function listingOf(row: ChatRow) {} // flagged
export function listingOf(row: ChatRow): ChatListing {} // ok
```

### qvac/no-inline-object-type

An object type spelled out in a signature has no name to read, reuse or document. Give it an
interface. Only function parameters and return types are checked.

```ts
function frame({ fileIndex }: { fileIndex: number }) {} // flagged

interface FrameOptions {
  fileIndex: number
}
function frame({ fileIndex }: FrameOptions) {} // ok
```

### qvac/prefer-interface

An object shape is an interface; `type` is for unions, intersections and mapped types. The fix
rewrites the alias. An interface has no implicit index signature, so a shape passed where
`Record<string, unknown>` is expected may need that parameter typed more precisely.

```ts
type Chat = { id: string; title: string } // flagged, autofix
interface Chat {
  id: string
  title: string
} // ok
type Status = 'open' | 'closed' // ok: not an object shape
```

### qvac/no-non-null-assertion

A `!` is a cast: it tells the compiler to stop checking. Narrow the value, or give the field a type
that is set whenever it is read. Tests are exempt.

```ts
const id = this._deviceId! // flagged
let final!: Frame // flagged

if (!this._deviceId) throw new Error('not open')
const id = this._deviceId // ok: narrowed
```

## License

Apache-2.0
