/**
 * Expressio
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'
import HTTPStatus from 'http-status'
import winstonExp from 'express-winston'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import joi from 'joi'
import { IS_DEV } from 'isenv'
import Sequelize from 'sequelize'
import dotenv from 'dotenv'
import optional from 'optional'

import {
  getModels,
  getConfig,
  isNodeSupported,
  isDir,
  logEvent,
  terminate,
} from './utils'

import {
  authorize,
  validate,
  notFoundHandler,
  generalErrorhandler,
} from './middlewares'

/**
 * expressio
 *
 * New server instance
 * to be loaded with a predefined
 * configuration.
 */
export default function expressio(appConfig) {
  let server
  let sequelize
  let models
  const app = express()

  const defaults = {
    folders: {
      public: 'public',
      models: 'models',
      db: 'db',
      config: 'config'
    },
    logger: {
      response: ['statusCode', 'body'],
      request: [
        'url',
        'headers',
        'method',
        'httpVersion',
        'originalUrl',
        'query',
        'body'
      ]
    }
  }

  // Check if rootPath config
  // was provided
  if (!isDir(appConfig.rootPath)) return terminate('"rootPath" is not valid.')

  // Load environment variables
  dotenv.config({ path: path.join(appConfig.rootPath, '.env') })

  const configPath = path.join(appConfig.rootPath, defaults.folders.config)
  const config = getConfig(configPath, appConfig)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(config.reqNode)) {
    return terminate('Current Node version is not supported.')
  }

  // Check if current default
  // paths are valid directories
  Object.keys(defaults.folders).forEach((name) => {
    // Make sure we check models folder only
    // if database is set
    if (name === 'models' && !config.db.enabled) return false
    if (name === 'db' && !config.db.enabled) return false

    const dirPath = path.join(config.rootPath, defaults.folders[name])
    const msg = `"${name}" folder does not exist.`

    if (!isDir(dirPath)) return terminate(msg)
  })

  // Define a public Dir for static content
  app.use(express.static(path.join(config.rootPath, defaults.folders.public)))

  // Parse incomming requests
  // to JSON format
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Add GZIP compression support
  // for HTTP responses
  app.use(compress())

  // Security
  // (CORS & HTTP Headers)
  app.use(helmet())
  app.use(cors(config.cors))

  // Logging
  if (IS_DEV) {
    // Setup console logging
    app.use(winstonExp.logger({
      transports: [
        new winston.transports.Console({ colorize: true, prettyPrint: true, })
      ],
      expressFormat: true,
      colorize: true,
      responseWhitelist: defaults.logger.response,
      requestWhitelist: defaults.logger.request
    }))
  }

  // Set database connection
  if (config.db.enabled) {
    const { db } = config
    const msg = `Database settings for "${config.env}" env does not exist.`

    if (!db.dialect) return terminate(msg)

    const dbPath = path.join(config.rootPath, defaults.folders.db)
    const storage = (db.dialect === 'sqlite') ? { storage: path.join(dbPath, db.storage) } : {}

    // Estabilish a new connection
    // with the database
    sequelize = new Sequelize({
      ...db,
      ...storage,
      logging: IS_DEV && console.log, // eslint-disable-line
      operatorsAliases: false
    })

    const modelsPath = path.join(config.rootPath, defaults.folders.models)
    models = getModels(modelsPath, sequelize, Sequelize)
  }

  // Add common config / objects
  // to request object and make
  // then available to other routes
  app.use((req, res, next) => {
    req.xp = {
      config,
      statusCode: HTTPStatus,
      jwt,
      ...models ? { models } : {},
      ...sequelize ? { db: sequelize } : {}
    }

    next()
  })

  // Add authorization
  app.use(authorize)

  /**
   * startServer
   *
   * Bootstrap server and
   * error handlers
   */
  app.startServer = (options = { resetDB: false, seedDB: false }) => {
    // Not found error handler
    app.use(notFoundHandler)

    // General error handler
    app.use(generalErrorhandler)

    server = app.listen(config.port, config.address, () => {
      const { address, port } = server.address()
      logEvent(`Server running → ${address}:${port} @ ${config.env}`)
    })

    app.syncDB(options)
  }

  /**
   * stopServer
   */
  app.stopServer = () => {
    server.close()
    sequelize.close()
  }

  /**
   * syncDB
   *
   * Sync database models
   */
  app.syncDB = (options = { resetDB: false, seedDB: false }) => {
    if (!sequelize) return false

    const seeds = options.seedDB && optional(path.join(config.rootPath, 'seeds'))

    sequelize.sync({ force: options.resetDB })
      .then(() => {
        if (options.resetDB) logEvent('Resetting database...')
        logEvent(`Database running → ${sequelize.getDialect()} @ ${config.env}`)

        if (seeds && seeds.default) {
          seeds.default(models)
          logEvent('Adding seed data...')
        }
      })
      .catch(() => terminate('Something went wrong while starting the database.'))
  }

  /**
   * resetDB
   */
  app.resetDB = () => {
    app.syncDB({ resetDB: true })
  }

  /**
   * seedDB
   */
  app.seedDB = () => {
    app.syncDB({ seedDB: true })
  }

  return app
}

/**
 * Expose Express
 * Object
 */
export { express }

/**
 * Expose Joi
 */
export { joi }

/**
 * Expose middlewares
 */
export { validate }
