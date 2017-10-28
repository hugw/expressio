/**
 * Utility Functions
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

/* eslint no-console: 0 */
import fs from 'fs'
import path from 'path'

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
 * isDir
 *
 * Check if current path
 * is a valid directory.
 */
export function isDir(dir) {
  try {
    const stats = fs.statSync(dir)
    return stats.isDirectory()
  } catch (e) { return false }
}

/**
 * getModels
 *
 * Auto load models
 * and return all into
 * a single object.
 */
export function getModels(dir) {
  const models = {}

  fs.readdirSync(dir).forEach((file) => {
    if (file !== 'index.js') {
      const moduleName = file.split('.')[0]
      const modulePath = path.join(dir, moduleName)
      models[moduleName] = require(modulePath) // eslint-disable-line
    }
  })

  return models
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
