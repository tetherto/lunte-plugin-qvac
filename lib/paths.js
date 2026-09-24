const TEST_PATH = /(^|[\\/])(test|tests|__tests__)[\\/]|\.(test|spec)\.[cm]?[jt]sx?$/
const TOOLING_PATH = /(^|[\\/])(examples?|scripts|bench|benchmarks)[\\/]/

export function isTestFile(filePath) {
  return TEST_PATH.test(filePath ?? '')
}

export function isToolingFile(filePath) {
  return TOOLING_PATH.test(filePath ?? '')
}
