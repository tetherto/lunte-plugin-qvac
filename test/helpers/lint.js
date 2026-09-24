import { analyze, loadPlugins } from 'lunte'

const plugin = new URL('../../index.js', import.meta.url).href

let loading = null

export async function lint(source, { rule, filePath = 'lib/example.ts', fix = false }) {
  loading ??= loadPlugins([plugin], { onError: fail })
  await loading

  const result = await analyze({ source, sourceFile: filePath, fix, write: false })
  const diagnostics = result.diagnostics.filter((d) => d.ruleId === rule || !d.ruleId)

  return {
    diagnostics,
    lines: diagnostics.map((d) => d.line),
    output: result.fixedOutputs.get(filePath) ?? source
  }
}

function fail(message) {
  throw new Error(message)
}
