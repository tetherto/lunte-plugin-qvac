import { noConditionalSpread } from './lib/rules/no-conditional-spread.js'
import { noCatchFabricate } from './lib/rules/no-catch-fabricate.js'
import { preferForAwait } from './lib/rules/prefer-for-await.js'
import { noSleep } from './lib/rules/no-sleep.js'
import { noSettimeout } from './lib/rules/no-settimeout.js'
import { noBufferGlobal } from './lib/rules/no-buffer-global.js'

export default {
  rules: [
    noConditionalSpread,
    noCatchFabricate,
    preferForAwait,
    noSleep,
    noSettimeout,
    noBufferGlobal
  ]
}
