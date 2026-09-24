import { noConditionalSpread } from './lib/rules/no-conditional-spread.js'
import { noCatchFabricate } from './lib/rules/no-catch-fabricate.js'
import { preferForAwait } from './lib/rules/prefer-for-await.js'

export default {
  rules: [noConditionalSpread, noCatchFabricate, preferForAwait]
}
