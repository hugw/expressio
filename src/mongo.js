/**
 * Mongo API
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import mongoose from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'
import { IS_DEV } from 'isenv'
import optional from 'optional'

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
 * Moongose setup
 */
mongoose.set('debug', IS_DEV)
mongoose.Promise = global.Promise
mongoose.plugin(beautifyUnique)
mongoose.plugin(schemaOpts)

export { mongoose }

/**
 * Database API
 */
export default (config) => {
  if (!config.connection) return terminate('Database connection does not exist.')

  const api = {}

  /**
   * Seed Only
   */
  api.seedOnly = async () => {
    const seed = optional(config.seed)

    if (seed && seed.default) {
      logEvent('Adding seed data...')

      try {
        await seed.default(mongoose.models)
        logEvent('Seed data added successfuly...')
      } catch (e) {
        logEvent(e, 'red')
        logEvent('An error occured while seeding database. Aborting...', 'red')
      }
    } else {
      logEvent('No seed data found...', 'red')
    }

    return Promise.resolve()
  }

  /**
   * Seed
   */
  api.seed = async (opts = { disconnect: false }) => {
    await api.connect()
    await api.resetOnly()
    await api.seedOnly()

    if (opts.disconnect) await api.disconnect()
    return Promise.resolve()
  }

  /**
   * Reset Only
   */
  api.resetOnly = async () => {
    logEvent('Resetting database...')

    const { collections } = mongoose.connection
    const promises = Object.values(collections).map(collection => collection.remove())

    return Promise.all(promises)
  }

  /**
   * Reset
   */
  api.reset = async (opts = { disconnect: false }) => {
    await api.connect()
    await api.resetOnly()

    if (opts.disconnect) await api.disconnect()
    return Promise.resolve()
  }

  /**
   * Connect
   */
  api.connect = async () => {
    if ([1, 2].includes(mongoose.connection.readyState)) {
      return Promise.resolve('Already connected')
    }

    try {
      await mongoose.connect(config.connection, { useMongoClient: true })
      logEvent(`Database running → MongoDB @ ${config.env}`)
      return Promise.resolve('Connected')
    } catch (e) {
      terminate('Something went wrong while starting the database.')
    }
  }

  /**
   * Disconnect
   */
  api.disconnect = () => mongoose.disconnect()

  return api
}
