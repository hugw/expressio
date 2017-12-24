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
import merge from 'lodash/merge'
import optional from 'optional'
import { CURRENT_ENV, IS_DEV } from 'isenv'
import chalk from 'chalk'

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
export function getModels(dir, sequelize, dataTypes) {
  const models = {}

  try {
    fs.readdirSync(dir)
      .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
      .forEach((file) => {
        const genModel = require(path.join(dir, file)).default
        const model = genModel(sequelize, dataTypes)
        models[model.name] = model
      })

    // We must first load all models
    // before assigning associations
    Object.keys(models).forEach((name) => {
      const model = models[name]
      if ('associate' in model) model.associate(models)
    })

    return models
  } catch (e) { return false }
}

/**
 * terminate
 *
 * Used when a requirement wasn't met
 * and the process had to be terminated.
 */
export function terminate(msg) {
  console.error(chalk.red(msg))
  process.exit(1)
}

/**
 * logEvent
 */
export const logEvent = msg => (IS_DEV && console.log(chalk.green(msg)))

/**
 * getConfig
 *
 * Load config variables based on
 * current environment.
 */
export function getConfig(dir, optionalConfig = {}) {
  const defaults = require('./config/default').default
  const config = require(`./config/${CURRENT_ENV}`).default

  // Make sure we don't break anything
  // if config files doesn't exist
  const appDefaults = optional(path.join(dir, 'default'))
  const appConfig = optional(path.join(dir, CURRENT_ENV))
  return merge(
    {},
    defaults,
    config,
    appDefaults && appDefaults.default,
    appConfig && appConfig.default,
    optionalConfig
  )
}
