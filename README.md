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

| Rule                         | What it enforces                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `qvac/no-conditional-spread` | No `...(x ? { x } : {})`; assign the field and let `undefined` propagate.         |
| `qvac/no-catch-fabricate`    | `.catch(noop)` instead of an inline `() => {}`, or a fallback value nobody reads. |
| `qvac/prefer-for-await`      | `for await` for a loop that opens an iterator and drains it with `it.next()`.     |
| `qvac/no-sleep`              | No `new Promise((r) => setTimeout(r, ms))` sleeps outside tests and tooling.      |
| `qvac/no-settimeout`         | Warns on every `setTimeout` / `setInterval` outside tests and tooling.            |
| `qvac/no-buffer-global`      | `b4a` instead of the `Buffer` global.                                             |

## License

Apache-2.0
