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
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Sequelize from 'sequelize'

import {
  getConfig,
  isNodeSupported,
  isDir,
  terminate,
  httpError
} from './utils'

import logger, { loggerMiddleware } from './logger'
import server from './server'
import mailerTransport from './mailer'
import mongo, { mongoose } from './mongo'
import sequelize from './sequelize'
import validatejs from './validate'

import { controller, authorize } from './middlewares'

import {
  notFoundErrorHandler,
  generalErrorHandler,
  mongooseErrorHandler,
  sequelizeErrorHandler,
  authorizationErrorHandler,
} from './error-handlers'

export default function expressio(appConfig) {
  const app = express()

  // Check if the config object was provided
  if (!(appConfig && appConfig.base)) return terminate('No valid configuration object was provided.')

  // Build main config object
  // based on current environment
  const config = getConfig(appConfig)

  // Check if rootPath was provided
  if (!isDir(config.root)) return terminate('"root" configuration is not a valid path.')

  const resolveApp = currentPath => path.join(config.root, currentPath)

  // Load environment variables
  dotenv.config({ path: resolveApp('.env') })

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(config.reqNode)) return terminate('Current Node version is not supported.')

  // Set log level
  logger.level = config.logLevel

  // Setup mailer
  const mailer = mailerTransport(config)

  // Define public folder for static content
  if (config.public) {
    const publicDir = resolveApp(config.public)
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

    app.use(express.static(publicDir))
  }

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
  app.use(loggerMiddleware(config))

  // Allow config and mailer
  // to be optionally availabe via req object
  app.use((req, res, next) => {
    req.config = config
    req.mailer = mailer
    req.models = config.sequelize && app.sequelize.models
    next()
  })

  /**
   * Mongo
   */
  app.mongo = config.mongo && mongo(config)

  /**
   * Sequelize
   */
  app.sequelize = config.sequelize && sequelize(config)

  /**
   * Server
   */
  app.server = server(app, config)

  /**
   * Start application
   *
   * Add error handlers, start server
   * and database when applied
   */
  app.start = async () => {
    // Error handlers
    app.use(notFoundErrorHandler)
    if (app.mongo) app.use(mongooseErrorHandler)
    if (app.sequelize) app.use(sequelizeErrorHandler)
    app.use(authorizationErrorHandler)
    app.use(generalErrorHandler)

    await app.server.start()
    if (app.mongo) await app.mongo.connect()
    if (app.sequelize) await app.sequelize.connect()
  }

  /**
   * Stop application
   */
  app.stop = () => {
    app.server.stop()
    if (app.mongo) app.mongo.disconnect()
    if (app.sequelize) app.sequelize.disconnect()
  }

  return { app, config, mailer }
}

/**
 * Expose external
 * dependencies and utility
 * functions
 */
const router = express.Router

export {
  jwt,
  validatejs,
  router,
  mongoose,
  httpError,
  logger,
  authorize,
  controller,
  Sequelize
}
