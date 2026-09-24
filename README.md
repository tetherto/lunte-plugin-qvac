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
  "rules": { "qvac/max-function-lines": "off" }
}
```

Rules that only make sense in product code skip test files: anything under a `test/`, `tests/` or
`__tests__/` directory, and `*.test.*` / `*.spec.*` files.

The timer rules also skip tooling under `examples/`, `scripts/` and `bench/`, which drives real
devices and external processes.

## Rules

| Rule                         | What it enforces                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `qvac/no-conditional-spread` | No `...(x ? { x } : {})`; assign the field and let `undefined` propagate.                   |
| `qvac/no-catch-fabricate`    | `.catch(noop)` instead of an inline `() => {}`, or a fallback value nobody reads.           |
| `qvac/prefer-for-await`      | `for await` for a loop that opens an iterator and drains it with `it.next()`.               |
| `qvac/no-sleep`              | No `new Promise((r) => setTimeout(r, ms))` sleeps outside tests and tooling.                |
| `qvac/no-settimeout`         | Warns on every `setTimeout` / `setInterval` outside tests and tooling.                      |
| `qvac/no-buffer-global`      | `b4a` instead of the `Buffer` global.                                                       |
| `qvac/no-explicit-any`       | No `any`.                                                                                   |
| `qvac/no-as-cast`            | No `as` / `<T>` assertions in product code; `as const` is fine.                             |
| `qvac/no-init-method`        | No `init()`; that is `ready()`.                                                             |
| `qvac/no-utils-file`         | No `utils` / `helpers` / `misc` / `common` files in product code.                           |
| `qvac/no-positional-boolean` | No `true` / `false` literal among several call arguments in product code.                   |
| `qvac/max-params`            | At most three positional parameters.                                                        |
| `qvac/no-nested-ternary`     | No ternary inside a ternary.                                                                |
| `qvac/max-function-lines`    | Warns on product functions over 40 lines.                                                   |
| `qvac/no-commented-code`     | No commented-out code.                                                                      |
| `qvac/comment-style`         | Comments are one `//` line under 100 characters: no blocks, no dividers.                    |
| `qvac/curly`                 | Braces everywhere except a one-line guard clause at the top of a function or loop. Autofix. |

## License

Apache-2.0
