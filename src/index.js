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
} from './utils'

import {
  controller,
  authorize,
  validate,
  schemaOpts
} from './middlewares'

import {
  generalError,
  validationError,
  notFoundHandler,
  generalErrorhandler,
  mongooseErrorHandler,
} from './error-handlers'

import validatejs from './validate'
import transport from './mailer'

export default function expressio(rootPath, appConfig = {}) {
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

  let server
  let models

  // Check if rootPath was provided
  if (!isDir(rootPath)) return terminate('"rootPath" is not valid.')

  // Load environment variables
  dotenv.config({ path: resolveApp('.env') })

  // Load config folder variables
  const configPath = resolveApp(folders.config)
  const config = getConfig(configPath, appConfig)

  // Setup mailer
  const mailer = transport(config.mailer)

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
    mongoose.plugin(schemaOpts)

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
      mailer,
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
    // Add error handlers
    app.use(notFoundHandler)
    app.use(mongooseErrorHandler)
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

    return new Promise((resolve) => {
      if ([1, 2].indexOf(mongoose.connection.readyState) === -1) {
        mongoose.connect(config.db.connection, { useMongoClient: true })
          .then(() => {
            logEvent(`Database running → MongoDB @ ${config.env}`)
            resolve('Connected')
          })
          .catch(() => terminate('Something went wrong while starting the database.'))
      } else resolve('Already connected')
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

  /**
   * mailer
   */
  app.mailer = mailer

  return app
}

/**
 * Expose external
 * dependencies and utility
 * functions
 */
export {
  HTTPStatus as statusCode,
  jwt,
  validatejs
}

/**
 * Expose middlewares
 */
export const middlewares = { validate, controller }

/**
 * Expose error handlers
 */
export const errorHandlers = { generalError, validationError }
