/**
 * Utility Functions
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

/* eslint no-console: 0 */

/**
 * isNodeSupported
 *
 * Check if current Node installed
 * is supported. In negative case
 * it will exit the process and abort
 * the whole operation.
 */
export function isNodeSupported(app) {
  const [major, minor] = process.versions.node.split('.').map(parseFloat)
  const minorCheck = (major === app.major && minor < app.minor)
  return !(major < app.major || minorCheck)
}

/**
 * hasPublicDir
 *
 * Check if current path
 * is a valid "publicDir" path.
 */
export function hasPublicDir(dir) {
  return !!dir
}

/**
 * terminate
 *
 * Used when a requirement wasn't met
 * and the process had to be closed.
 */
export function terminate(msg) {
  console.error(msg)
  process.exit()
  return true
}
