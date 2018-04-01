/**
 * Mongo
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import fs from 'fs'
import mongoose from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'
import { IS_DEV } from 'isenv'
import optional from 'optional'
import path from 'path'

import {
  logEvent,
  terminate,
} from './utils'

/**
 * schemaOpts
 *
 * Add global options for
 * mongoose schemas
 */
const schemaOpts = (schema) => {
  const toOpts = {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id // eslint-disable-line
      delete ret.__v // eslint-disable-line

      if (schema.options.filter) {
        schema.options.filter.forEach((key) => {
          delete ret[key] // eslint-disable-line
        })
      }
    }
  }

  schema.set('timestamps', true)
  schema.set('minimize', false)
  schema.set('toJSON', toOpts)
  schema.set('toObject', toOpts)
}

/**
 * getModels
 *
 * Auto load models
 * and return all into
 * a single object.
 */
function getModels(dir) {
  const models = {}

  try {
    fs.readdirSync(dir)
      .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
      .forEach((file) => {
        const genModel = require(path.join(dir, file)).default
        const model = genModel(mongoose, mongoose.Schema)

        models[model.modelName] = model
      })

    return models
  } catch (e) { return false }
}

/**
 * Database API
 */
export default (config) => {
  if (!config.db.enabled) return null
  if (!config.db.connection) return terminate(`Database connection for "${config.env}" env does not exist.`)

  // Setup mongoose specifics
  mongoose.set('debug', IS_DEV)
  mongoose.Promise = global.Promise
  mongoose.plugin(beautifyUnique)
  mongoose.plugin(schemaOpts)

  const api = {}
  const modelsPath = path.join(config.rootPath, config.folders.models)
  const seedPath = path.join(config.rootPath, 'seed')

  /**
   * Seed
   */
  api.seed = async () => {
    await api.start()
    await api.reset({ stop: false })

    const seed = optional(seedPath)

    if (seed && seed.default) {
      logEvent('Adding seed data...')
      await seed.default(api.models)
    } else {
      logEvent('No seed data found...')
    }

    await api.stop()
    return Promise.resolve()
  }

  /**
   * Reset
   */
  api.reset = async (opts = { stop: true }) => {
    await api.start()

    logEvent('Resetting database...')

    const promises = Object.values(api.models).map(model => model.collection.remove())
    await Promise.all(promises)

    if (opts.stop) await api.stop()
    return Promise.resolve()
  }

  /**
   * Start
   */
  api.start = async () => {
    if ([1, 2].includes(mongoose.connection.readyState)) {
      return Promise.resolve('Already connected')
    }

    try {
      await mongoose.connect(config.db.connection, { useMongoClient: true })
      logEvent(`Database running → MongoDB @ ${config.env}`)
      return Promise.resolve('Connected')
    } catch (e) {
      terminate('Something went wrong while starting the database.')
    }
  }

  /**
   * Stop
   */
  api.stop = () => mongoose.disconnect()

  /**
   * Models
   */
  api.models = getModels(modelsPath)

  return {
    ...api,
    mongoose,
  }
}
