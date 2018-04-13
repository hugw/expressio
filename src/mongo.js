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
import path from 'path'

import { terminate } from './utils'
import logger from './logger'

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
mongoose.set('debug', IS_DEV) // @TODO Move to winston
mongoose.Promise = global.Promise
mongoose.plugin(beautifyUnique)
mongoose.plugin(schemaOpts)

export { mongoose }

/**
 * Database API
 */
export default ({ mongo: config, env, root }) => {
  if (!config.connection) return terminate('Database connection does not exist.')

  const database = {}

  /**
   * Seed Only
   */
  database.seedOnly = async () => {
    const seed = config.seed && optional(path.join(root, config.seed))

    if (seed && seed.default) {
      logger.info('Adding seed data...')

      try {
        await seed.default(mongoose.models)
        logger.info('Seed data added successfuly.')
      } catch (e) {
        logger.info('An error ocurred while seeding database. Process aborted.')
        logger.info(e)
      }
    } else {
      logger.info('No seed data found.')
    }
  }

  /**
   * Seed
   */
  database.seed = async (opts = { disconnect: false }) => {
    await database.connect()
    await database.resetOnly()
    await database.seedOnly()

    if (opts.disconnect) database.disconnect()
  }

  /**
   * Reset Only
   */
  database.resetOnly = async () => {
    logger.info('Resetting database...')

    const { collections } = mongoose.connection
    const promises = Object.values(collections).map(collection => collection.remove())

    await Promise.all(promises)
    logger.info('Database reset successfully.')
  }

  /**
   * Reset
   */
  database.reset = async (opts = { disconnect: false }) => {
    await database.connect()
    await database.resetOnly()

    if (opts.disconnect) database.disconnect()
  }

  /**
   * Connect
   */
  database.connect = async () => {
    if ([1, 2].includes(mongoose.connection.readyState)) {
      return 'Mongo already connected'
    }

    try {
      await mongoose.connect(config.connection, { useMongoClient: true })
      logger.info(`Database running → MongoDB @ ${env}.`)
    } catch (e) {
      terminate('Something went wrong while starting the database.')
    }
  }

  /**
   * Disconnect
   */
  database.disconnect = () => {
    mongoose.disconnect()
  }

  return database
}
