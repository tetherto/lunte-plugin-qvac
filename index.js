import { noConditionalSpread } from './lib/rules/no-conditional-spread.js'
import { noCatchFabricate } from './lib/rules/no-catch-fabricate.js'
import { preferForAwait } from './lib/rules/prefer-for-await.js'
import { noSleep } from './lib/rules/no-sleep.js'
import { noSettimeout } from './lib/rules/no-settimeout.js'
import { preferB4a } from './lib/rules/prefer-b4a.js'
import { noStringCompareBytes } from './lib/rules/no-string-compare-bytes.js'
import { noExplicitAny } from './lib/rules/no-explicit-any.js'
import { noAsCast } from './lib/rules/no-as-cast.js'
import { noInitMethod } from './lib/rules/no-init-method.js'
import { noUtilsFile } from './lib/rules/no-utils-file.js'
import { noPositionalBoolean } from './lib/rules/no-positional-boolean.js'
import { maxParams } from './lib/rules/max-params.js'
import { noNestedTernary } from './lib/rules/no-nested-ternary.js'
import { maxFunctionLines } from './lib/rules/max-function-lines.js'
import { noCommentedCode } from './lib/rules/no-commented-code.js'
import { commentStyle } from './lib/rules/comment-style.js'
import { curly } from './lib/rules/curly.js'
import { paddingLines } from './lib/rules/padding-lines.js'
import { readyGuard } from './lib/rules/ready-guard.js'
import { noNodeStream } from './lib/rules/no-node-stream.js'
import { maxDepth } from './lib/rules/max-depth.js'
import { noElseAfterReturn } from './lib/rules/no-else-after-return.js'
import { linesBetweenClassMembers } from './lib/rules/lines-between-class-members.js'
import { noDefaultExport } from './lib/rules/no-default-export.js'
import { explicitReturnType } from './lib/rules/explicit-return-type.js'
import { noInlineObjectType } from './lib/rules/no-inline-object-type.js'
import { preferInterface } from './lib/rules/prefer-interface.js'
import { noNonNullAssertion } from './lib/rules/no-non-null-assertion.js'
import { noInlineCollectionName } from './lib/rules/no-inline-collection-name.js'
import { noConstantNullish } from './lib/rules/no-constant-nullish.js'
import { preferAlike } from './lib/rules/prefer-alike.js'
import { preferNarrowingCheck } from './lib/rules/prefer-narrowing-check.js'

export const rules = [
  noConditionalSpread,
  noCatchFabricate,
  preferForAwait,
  noSleep,
  noSettimeout,
  preferB4a,
  noStringCompareBytes,
  noExplicitAny,
  noAsCast,
  noInitMethod,
  noUtilsFile,
  noPositionalBoolean,
  maxParams,
  noNestedTernary,
  maxFunctionLines,
  noCommentedCode,
  commentStyle,
  curly,
  paddingLines,
  readyGuard,
  noNodeStream,
  maxDepth,
  noElseAfterReturn,
  linesBetweenClassMembers,
  noDefaultExport,
  explicitReturnType,
  noInlineObjectType,
  preferInterface,
  noNonNullAssertion,
  noInlineCollectionName,
  noConstantNullish,
  preferAlike,
  preferNarrowingCheck
]
