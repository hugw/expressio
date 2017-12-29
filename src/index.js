/**
 * Expressio
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import fs from 'fs'
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
import dotenv from 'dotenv'
import optional from 'optional'
import mongoose from 'mongoose'
import beautifyUnique from 'mongoose-beautiful-unique-validation'

import {
  getModels,
  getConfig,
  isNodeSupported,
  isDir,
  logEvent,
  terminate,
  reqError,
} from './utils'

import {
  authorize,
  validate,
  notFoundHandler,
  generalErrorhandler,
  mongooseErrorHandler
} from './middlewares'

export default function expressio(rootPath, appConfig = {}) {
  let server
  let models

  const folders = {
    public: 'public',
    models: 'models',
    config: 'config'
  }

  const logger = {
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

  const app = express()

  const resolveApp = currentPath => path.join(rootPath, currentPath)

  // Check if rootPath was provided
  if (!isDir(rootPath)) return terminate('"rootPath" is not valid.')

  // Load environment variables
  dotenv.config({ path: resolveApp('.env') })

  // Load config folder variables
  const configPath = resolveApp(folders.config)
  const config = getConfig(configPath, appConfig)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(config.reqNode)) return terminate('Current Node version is not supported.')

  // Create required folders if they do not exist
  Object.keys(folders).forEach((folder) => {
    // Models folder should be created
    // only if database is enabled
    if (folder === 'models' && !config.db.enabled) return false

    const dir = resolveApp(folders[folder])
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  })

  // Define a the public dir for static content
  app.use(express.static(resolveApp(folders.public)))

  // Parse incoming requests
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
      responseWhitelist: logger.response,
      requestWhitelist: logger.request
    }))
  }

  // Set database related
  // information
  if (config.db.enabled) {
    const { db } = config
    if (!db.connection) return terminate(`Database connection for "${config.env}" env does not exist.`)

    // Setup mongoose specifics
    mongoose.set('debug', IS_DEV)
    mongoose.Promise = global.Promise
    mongoose.plugin(beautifyUnique)
    mongoose.plugin((schema) => {
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
    })

    // Load models
    const modelsPath = resolveApp(folders.models)
    models = getModels(modelsPath, mongoose)
  }

  // Add common config / objects
  // to request object and make
  // then available to other routes
  app.use((req, res, next) => {
    req.xp = {
      config,
      statusCode: HTTPStatus,
      jwt,
      reqError,
      ...models ? { models } : {}
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

    // Mongoose error handler
    app.use(mongooseErrorHandler)

    // General error handler
    app.use(generalErrorhandler)

    server = app.listen(config.port, config.address, () => {
      const { address, port } = server.address()
      logEvent(`Server running → ${address}:${port} @ ${config.env}`)
    })

    app.startDB(options)
  }

  /**
   * stopServer
   */
  app.stopServer = () => {
    if (server) server.close()
    app.stopDatabase()
  }

  /**
   * stopDatabase
   */
  app.stopDB = () => {
    if (config.db) mongoose.disconnect()
  }

  /**
   * startDB
   */
  app.startDB = () => {
    if (!config.db.enabled) return Promise.reject()

    return new Promise((resolve, reject) => {
      if ([1, 2].indexOf(mongoose.connection.readyState) === -1) {
        mongoose.connect(config.db.connection, { useMongoClient: true }).then(resolve).catch(reject)
        mongoose.connection.once('connected', () => logEvent(`Database running → MongoDB @ ${config.env}`))
        mongoose.connection.once('error', () => terminate('Something went wrong while starting the database.'))
      } else resolve()
    })
  }

  /**
   * resetDB
   */
  app.resetDB = () => (app.startDB().then(() => {
    logEvent('Resetting database...')
    const promises = Object.keys(models).map(model => models[model].collection.remove())
    return Promise.all(promises)
  }))

  /**
   * seedDB
   */
  app.seedDB = () => (app.startDB().then(() => {
    const seeds = optional(resolveApp('seeds'))
    const promises = []
    if (seeds && seeds.default) {
      logEvent('Adding seed data...')
      return Promise.all(seeds.default(models, promises))
    }

    return Promise.resolve()
  }))

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
