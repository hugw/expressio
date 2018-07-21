/**
 * Database: Sequelize Adapter
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import Joi from 'joi'
import ndtk from 'ndtk'
import path from 'path'
import fs from 'fs'
import Sequelize from 'sequelize'

import utils from '@/utils'
import migrations from '@/migrations'

/**
 * Auto load models
 * and return them into
 * a single object
 */
function getModels(dir, sequelize) {
  const models = {}

  fs.readdirSync(dir)
    .filter(file => ((file.indexOf('.') !== 0) && (file !== 'index.js')))
    .forEach((file) => {
      const model = sequelize.import(path.join(dir, file))
      models[model.name] = model
    })

  Object.values(models).forEach(md => md.associate && md.associate(models))

  return models
}

/**
 * Get database directories
 *
 * /models
 * /db
 *   /migrations
 *   /sqlite
 */
function getDirs(root, isSqlite) {
  const models = path.join(root, 'models')
  const db = path.join(root, 'db')
  const migrations = path.join(db, 'migrations') // eslint-disable-line
  const sqlite = path.join(db, 'sqlite')

  if (!ndtk.isDir(models)) fs.mkdirSync(models)
  if (!ndtk.isDir(db)) fs.mkdirSync(db)
  if (!ndtk.isDir(sqlite) && isSqlite) fs.mkdirSync(sqlite)
  if (!ndtk.isDir(migrations)) fs.mkdirSync(migrations)

  return {
    models,
    db,
    migrations,
    sqlite,
  }
}

/**
 * Format Sequelize errors
 */
const errorHandler = (err, req, res, next) => {
  const allowed = ['SequelizeUniqueConstraintError', 'SequelizeValidationError']

  if (allowed.includes(err.name)) {
    const iterator = (obj, { message, path, validatorKey }) => Object.assign({}, obj, { // eslint-disable-line
      [path]: {
        message: validatorKey === 'not_unique' ? `${path} is already in use` : message,
        type: validatorKey === 'not_unique' ? 'unique' : validatorKey,
      },
    })

    const seqError = ndtk.httpError(422, {
      message: 'Invalid data',
      type: 'VALIDATION',
      attributes: err.errors.reduce(iterator, {}),
    })

    return next(seqError)
  }

  return next(err)
}

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  enabled: Joi.boolean().required(),
  dialect: Joi.string().trim().valid(['sqlite', 'postgres']).required(),
  connection: Joi.string().required(),
  ssl: Joi.boolean().required(),
})

export default (server, config) => {
  const {
    enabled,
    dialect,
    connection,
    ssl,
  } = utils.sanitize(config, schema, 'Invalid Database config')

  if (!enabled) return

  const { logger, root } = server

  // Get / Create directories
  const dir = getDirs(root, dialect === 'sqlite')

  // Setup connection signature
  const psqlPrefix = connection.indexOf('postgres://') === -1 ? `${dialect}://` : ''
  const conn = dialect === 'sqlite'
    ? `${dialect}:${dir.sqlite}/${connection}`
    : `${psqlPrefix}${connection}`

  // Create new Sequelize instance
  const sequelize = new Sequelize(conn, {
    operatorsAliases: false,
    logging: msg => msg.indexOf('SequelizeMeta') === -1 && logger.info(msg),
    dialectOptions: { ssl },
  })

  // Setup models
  const models = getModels(dir.models, sequelize)

  // Setup migrations api
  const migrate = migrations(sequelize, dir.migrations, logger)

  /**
   * Connect
   */
  const connect = async () => {
    try {
      const { pending } = await migrate.status()
      if (pending.length) throw new Error('Database error: please execute pending migrations')
      await sequelize.authenticate()
      logger.info(`Database running → ${dialect} @ ${server.env}`)
    } catch (e) {
      throw e
    }
  }

  /**
   * Disconnect
   */
  const disconnect = async () => {
    await sequelize.close()
  }

  /**
   * Reset
   */
  const reset = async () => {
    await sequelize.drop()
    await migrate.run('up')
  }

  /**
   * Seed
   */
  const seed = async () => {
    const fn = ndtk.req(`${dir.db}/seed`)

    if (fn) {
      await reset()
      logger.info('Database: adding seed data...')

      try {
        await fn(models, server.env)
        server.logger.info('Database: seed data added successfuly')
      } catch (e) {
        logger.error(e)
      }
    } else {
      logger.error('Database error: No seed data found at the location "db/seed.js"')
    }
  }

  /**
   * Truncate
   */
  const truncate = async () => {
    const values = Object.values(models)
    const promises = values.map(model => model.destroy({ truncate: true }))
    return Promise.all(promises)
  }

  /**
   * Run
   */
  const run = async (cmd) => {
    const tasks = { seed, reset, truncate }
    if (['up', 'down', 'prev', 'next'].includes(cmd)) await migrate.run(cmd)
    if (['seed', 'reset', 'truncate'].includes(cmd)) await tasks[cmd]()
    process.exit(0)
  }

  // Expose Database Api to the server object
  server.database = {
    connect,
    disconnect,
    seed,
    truncate,
    run,
    reset,
    migrate,
    instance: sequelize,
  }
  server.Sequelize = Sequelize
  server.models = models

  // Expose Database Api to the request object
  server.use((req, res, next) => {
    req.models = models
    req.Op = Sequelize.Op
    next()
  })

  // Register events
  server.events.on('preStart', srv => srv.use(errorHandler))
  server.events.on('preStart', connect)
  server.events.on('preStop', disconnect)
}
