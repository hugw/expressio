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
export function getModels(dir, sequelize, dataTypes) {
  const models = {}

  try {
    fs.readdirSync(dir)
      .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
      .forEach((file) => {
        const genModel = require(path.join(dir, file)).default // eslint-disable-line
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
  console.error(msg)
  process.exit(1)
}
