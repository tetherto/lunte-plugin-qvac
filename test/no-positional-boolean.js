import test from 'brittle'

import { lint } from './helpers/lint.js'

const rule = 'qvac/no-positional-boolean'

test('flags boolean literals among several arguments', async (t) => {
  const { lines } = await lint(
    `render(node, true, false)
this.update(chat, false)
new Watcher(core, true)
`,
    { rule }
  )

  t.alike(lines, [1, 2, 3])
})

test('single arguments, value methods and tests pass', async (t) => {
  const { lines } = await lint(
    `setVisible(true)
map.set(key, true)
list.fill(false, 0)
this.emit('ready', true)
const [open, setOpen] = useState(false)
render(node, { deep: true })
view.getUint16(0, true)
view.setFloat32(4, value, true)
`,
    { rule }
  )
  const inTest = await lint('t.is(ok, true)\n', { rule, filePath: 'test/a.ts' })

  t.alike(lines, [])
  t.alike(inTest.lines, [])
})
