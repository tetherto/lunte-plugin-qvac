import { isTestFile } from '../paths.js'

const GRAB_BAG = /(^|[\\/])(utils?|helpers?|misc|common)\.[cm]?[jt]sx?$/

export const noUtilsFile = {
  meta: {
    name: 'qvac/no-utils-file',
    description: 'Name a file for its domain, not utils or helpers.'
  },
  create(context) {
    if (isTestFile(context.filePath) || !GRAB_BAG.test(context.filePath ?? '')) {
      return {}
    }

    return {
      Program(node) {
        context.report({
          node,
          message:
            'A utils/helpers file is a grab bag; move each piece to the domain it belongs to.'
        })
      }
    }
  }
}
