import { analyze, builtInRules, loadPlugins, registerRule } from 'lunte'

const plugin = new URL('../../index.js', import.meta.url).href

let loading = null

export async function lint(source, { rule, filePath = 'lib/example.ts', fix = false, options }) {
  loading ??= loadPlugins([plugin], { onError: fail })
  await loading

  const ruleId = options ? withOptions(rule, options) : rule
  const result = await analyze({ source, sourceFile: filePath, fix, write: false })
  const diagnostics = result.diagnostics.filter((d) => d.ruleId === ruleId || !d.ruleId)
  if (options) {
    builtInRules.delete(ruleId)
  }

  return {
    diagnostics,
    lines: diagnostics.map((d) => d.line),
    output: result.fixedOutputs.get(filePath) ?? source
  }
}

// stands in for lunte handing options to rules, which it does not do yet
function withOptions(name, options) {
  const rule = builtInRules.get(name)
  const id = `${name}#options`
  registerRule({
    meta: { ...rule.meta, name: id },
    create: (context) => rule.create(Object.assign(context, { options }))
  })

  return id
}

function fail(message) {
  throw new Error(message)
}
