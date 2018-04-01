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

import {
  getConfig,
  isNodeSupported,
  isDir,
  logEvent,
  terminate,
} from './utils'

import {
  controller,
  authorize,
  validate
} from './middlewares'

import {
  generalError,
  validationError,
  notFoundHandler,
  generalErrorhandler,
  mongooseErrorHandler,
} from './error-handlers'

import validatejs from './validate'
import mailerTransport from './mailer'
import mongo from './mongo'
import { FOLDERS, LOGGER } from './constants'

export default function expressio(rootPath, appConfig = {}) {
  const app = express()
  const resolveApp = currentPath => path.join(rootPath, currentPath)

  let server

  // Check if rootPath was provided
  if (!isDir(rootPath)) return terminate('"rootPath" is not valid.')

  // Load environment variables
  dotenv.config({ path: resolveApp('.env') })

  // Load config folder variables
  const configPath = resolveApp(FOLDERS.config)
  const config = getConfig(configPath, appConfig)

  // Setup mailer
  const mailer = mailerTransport(config.mailer)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(config.reqNode)) return terminate('Current Node version is not supported.')

  // Create required folders if they do not exist
  Object.keys(FOLDERS).forEach((folder) => {
    // Models folder should be created
    // only if database is enabled
    if (folder === 'models' && !config.db.enabled) return false

    const dir = resolveApp(FOLDERS[folder])
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  })

  // Define a the public dir for static content
  app.use(express.static(resolveApp(FOLDERS.public)))

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
      responseWhitelist: LOGGER.response,
      requestWhitelist: LOGGER.request
    }))
  }

  // Setup database
  const database = mongo(rootPath, config)

  // Add common config / objects
  // to request object and make
  // then available to other routes
  app.use((req, res, next) => {
    req.xp = {
      config,
      mailer,
      models: database && database.models
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
  app.startServer = () => {
    // Add error handlers
    app.use(notFoundHandler)
    app.use(mongooseErrorHandler)
    app.use(generalErrorhandler)

    server = app.listen(config.port, config.address, () => {
      const { address, port } = server.address()
      logEvent(`Server running → ${address}:${port} @ ${config.env}`)
    })

    if (database) database.start()
  }

  /**
   * stopServer
   */
  app.stopServer = () => {
    if (server) server.close()
    if (database) database.stop()
  }

  /**
   * mailer
   */
  app.mailer = mailer

  /**
   * Database
   */
  app.database = database

  return app
}

/**
 * Expose external
 * dependencies and utility
 * functions
 */
const router = express.Router

export {
  HTTPStatus as statusCode,
  jwt,
  validatejs,
  router
}

/**
 * Expose middlewares
 */
export const middlewares = { validate, controller }

/**
 * Expose error handlers
 */
export const errorHandlers = { generalError, validationError }
