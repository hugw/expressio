/**
 * Sequelize API
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import Sequelize from 'sequelize'
import path from 'path'
import fs from 'fs'
import Umzug from 'umzug'
import optional from 'optional'

import { terminate } from './utils'
import logger from './logger'

/**
 * getModels
 *
 * Auto load models
 * and return all into
 * a single object.
 */
function getModels(dir, sequelize) {
  const models = {}

  try {
    fs.readdirSync(dir)
      .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
      .forEach((file) => {
        const model = sequelize.import(path.join(dir, file))
        models[model.name] = model
      })

    Object.values(models).forEach(md => md.associate && md.associate(models))

    return models
  } catch (e) { return false }
}

/**
 * Migrations API
 */
function migrations(sequelize, dir) {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: { sequelize },

    // see: https://github.com/sequelize/umzug/issues/17
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        sequelize.constructor,
        () => {
          throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
        }
      ],
      path: dir,
      pattern: /\.js$/
    },

    logging: logger.info
  })

  const api = {}

  /**
   * Status
   */
  api.status = async () => {
    const exec = await umzug.executed()
    const pend = await umzug.pending()
    const iterator = m => ({ ...m, name: path.basename(m.file, '.js') })

    const executed = exec.reverse().map(iterator)
    const pending = pend.map(iterator)

    return { executed, pending }
  }

  /**
   * Down
   */
  api.down = () => umzug.down({ to: 0 })

  /**
   * Up
   */
  api.up = () => umzug.up()

  /**
   * Prev
   */
  api.prev = async () => {
    const { executed } = await api.status()

    if (!executed.length) return Promise.reject(new Error('Already at the initial state'))
    const prev = executed[0].name
    return umzug.down({ to: prev })
  }

  /**
   * Next
   */
  api.next = async () => {
    const { pending } = await api.status()

    if (!pending.length) return Promise.reject(new Error('No pending migrations left'))
    const next = pending[0].name
    return umzug.up({ to: next })
  }

  /**
   * Summary
   */
  api.summary = async () => {
    const { executed, pending } = await api.status()
    const current = executed.length > 0 ? executed[0].file : 'no migrations'

    logger.info('== Summary =======')
    logger.info('current:', current)
    logger.info('pending:', pending.map(m => m.file).join(', ') || 'no migrations')
    logger.info('executed:', executed.map(m => m.file).join(', ') || 'no migrations')
  }

  /**
   * Run
   */
  api.run = async (cmd) => {
    try {
      await api[cmd]()
    } catch (err) {
      logger.error(err)
    } finally {
      await api.summary()
      process.exit(0)
    }
  }

  return api
}

/**
 * Database API
 */
export default ({ sequelize: config, env, root }) => {
  const { connection } = config
  if (!connection) return terminate('Sequelize database connection does not exist.')

  // Create models/db folder if it doesn't exist
  let modelsDir
  let dbDir
  let migrationsDir
  let sqliteDir
  if (config.folder) {
    modelsDir = path.join(root, config.folder.models)
    dbDir = path.join(root, config.folder.db)
    migrationsDir = path.join(dbDir, 'migrations')
    sqliteDir = path.join(dbDir, 'sqlite')

    if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir)
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
    if (!fs.existsSync(sqliteDir)) fs.mkdirSync(sqliteDir)
    if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir)
  }

  const database = {}
  const sequelize = new Sequelize(
    connection.database,
    connection.username,
    connection.password,
    {
      dialect: connection.dialect,
      host: connection.host,
      operatorsAliases: false,
      storage: connection.storage && sqliteDir && path.join(sqliteDir, connection.storage),
      ...connection.config,
      logging: message => message.indexOf('SequelizeMeta') === -1 && logger.info(message)
    }
  )

  /**
   * Models
   */
  database.models = getModels(modelsDir, sequelize)

  /**
   * Migrations
   */
  database.migrations = migrations(sequelize, migrationsDir)

  /**
   * Connect
   */
  database.connect = async () => {
    try {
      const { pending } = await database.migrations.status()
      if (pending.length) throw new Error('migrations')

      await sequelize.authenticate()
      logger.info(`Database running → ${connection.dialect} @ ${env}.`)
    } catch (e) {
      if (e.message === 'migrations') terminate('Please migrate pending migrations.')
      terminate('Something went wrong while starting Sequelize database.')
    }
  }

  /**
   * Seed
   */
  database.seed = async () => {
    const seed = config.seed && optional(path.join(root, config.seed))

    if (seed && seed.default) {
      await sequelize.drop()
      await database.migrations.up()

      logger.info('Adding seed data...')

      try {
        await seed.default(database.models, env)
        logger.info('Seed data added successfuly.')
      } catch (e) {
        logger.info('An error ocurred while seeding Sequelize database. Process aborted.')
        logger.info(e)
      }
    } else {
      logger.info('No seed data found.')
    }
  }

  /**
   * Disconnect
   */
  database.disconnect = async () => {
    await sequelize.close()
  }

  /**
   * Reset
   */
  database.reset = async () => {
    await sequelize.drop()
    await database.migrations.up()
  }

  /**
   * Truncate
   */
  database.truncate = async () => sequelize.truncate()

  database.instance = sequelize

  return database
}
