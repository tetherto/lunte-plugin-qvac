const TEST_PATH = /(^|[\\/])(test|tests|__tests__)[\\/]|\.(test|spec)\.[cm]?[jt]sx?$/

export function isTestFile(filePath) {
  return TEST_PATH.test(filePath ?? '')
}
