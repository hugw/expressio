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

import {
  getConfig,
  isNodeSupported,
  isDir,
  terminate,
  httpError
} from './utils'

import logger, { loggerMiddleware } from './logger'
import server from './server'
import mailer from './mailer'
import mongo, { mongoose } from './mongo'
import validatejs from './validate'

import {
  controller,
  authorize,
  validate,
  configuration
} from './middlewares'

import {
  notFoundErrorHandler,
  generalErrorHandler,
  mongooseErrorHandler,
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

  // Authorization
  app.authorize = authorize(app, config)

  // Validation
  app.use(validate)

  // Configuration
  app.use(configuration(config))

  /**
   * Database
   */
  app.database = mongo(config)

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
    if (app.database) app.use(mongooseErrorHandler)
    app.use(authorizationErrorHandler)
    app.use(generalErrorHandler)

    await app.server.start()
    if (app.database) await app.database.connect()
  }

  /**
   * Stop application
   */
  app.stop = () => {
    app.server.stop()
    if (app.database) app.database.disconnect()
  }

  return {
    app,
    config,
    mailer: mailer(config)
  }
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
  authorize
}

/**
 * Expose middlewares
 */
export const middlewares = {
  controller
}
