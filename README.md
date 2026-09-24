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

## Rules

| Rule                         | What it enforces                                                          |
| ---------------------------- | ------------------------------------------------------------------------- |
| `qvac/no-conditional-spread` | No `...(x ? { x } : {})`; assign the field and let `undefined` propagate. |

## License

Apache-2.0
