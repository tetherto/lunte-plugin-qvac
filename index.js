import { noConditionalSpread } from './lib/rules/no-conditional-spread.js'
import { noCatchFabricate } from './lib/rules/no-catch-fabricate.js'
import { preferForAwait } from './lib/rules/prefer-for-await.js'
import { noSleep } from './lib/rules/no-sleep.js'
import { noSettimeout } from './lib/rules/no-settimeout.js'
import { noBufferGlobal } from './lib/rules/no-buffer-global.js'
import { noExplicitAny } from './lib/rules/no-explicit-any.js'
import { noAsCast } from './lib/rules/no-as-cast.js'
import { noInitMethod } from './lib/rules/no-init-method.js'
import { noUtilsFile } from './lib/rules/no-utils-file.js'
import { noPositionalBoolean } from './lib/rules/no-positional-boolean.js'
import { maxParams } from './lib/rules/max-params.js'
import { noNestedTernary } from './lib/rules/no-nested-ternary.js'
import { maxFunctionLines } from './lib/rules/max-function-lines.js'

export default {
  rules: [
    noConditionalSpread,
    noCatchFabricate,
    preferForAwait,
    noSleep,
    noSettimeout,
    noBufferGlobal,
    noExplicitAny,
    noAsCast,
    noInitMethod,
    noUtilsFile,
    noPositionalBoolean,
    maxParams,
    noNestedTernary,
    maxFunctionLines
  ]
}
