/**
 * Utility Functions
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

/* eslint no-console: 0 */
import fs from 'fs'
import merge from 'lodash/merge'
import camelCase from 'lodash/camelCase'
import statuses from 'statuses'

import logger from './logger'
import config from './config'

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
 * terminate
 *
 * Used when a requirement wasn't met
 * and the process had to be terminated.
 */
export function terminate(msg) {
  logger.error(msg)
  process.exit(1)
}

/**
 * getConfig
 *
 * Load config variables based on
 * current environment.
 */
export function getConfig(appConfig) {
  const { env } = config.base

  return merge(
    {},
    config.base,
    config[env],
    appConfig.base,
    appConfig[env] && appConfig[env],
  )
}

/**
 * httpError
 */
export function httpError(code, meta = {}) {
  const status = statuses[code] ? code : 500
  const message = meta.message || statuses[status]
  const type = meta.type || camelCase(statuses[status])
  const errors = meta.errors || undefined

  const error = new Error(message)

  error.isHttp = true
  error.output = {
    status,
    message,
    type,
    ...errors ? { errors } : {}
  }

  return error
}
