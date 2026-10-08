import { analyze, loadPlugins } from 'lunte'

const plugin = new URL('../../index.js', import.meta.url).href

let loading = null

export async function lint(source, { rule, filePath = 'lib/example.ts', fix = false, options }) {
  loading ??= loadPlugins([plugin], { onError: fail })
  await loading

  const ruleOverrides = options ? [{ name: rule, severity: ['error', ...options] }] : []
  const result = await analyze({ source, sourceFile: filePath, fix, write: false, ruleOverrides })
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
