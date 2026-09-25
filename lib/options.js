// lunte hands rule options as context.options once it supports them; until then the defaults apply
export function optionsOf(context, defaults) {
  return { ...defaults, ...context.options?.[0] }
}
