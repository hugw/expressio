/**
 * Expressio
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

/* eslint no-console: 0 */
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'
import HTTPStatus from 'http-status'
import chalk from 'chalk'
import winstonExp from 'express-winston'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import joi from 'joi'
import { IS_DEV } from 'isenv'
import merge from 'lodash/merge'

import defaultSettings from './settings'

import {
  isNodeSupported,
  isDir,
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
export default function expressio(appSettings) {
  let server
  const app = express()

  const defaults = {
    folders: {
      public: 'public',
      models: 'models',
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

  const settings = merge({}, defaultSettings, appSettings)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(settings.reqNode)) {
    return terminate(chalk.red('Current Node version is not supported.'))
  }

  // Check if rootPath settings
  // was provided
  if (!isDir(settings.rootPath)) return terminate(chalk.red('"rootPath" is not valid.'))

  // Check if current default
  // paths are valid directories
  Object.keys(defaults.folders).forEach((name) => {
    // Make sure we check models folder only
    // if database is set
    if (name === 'models' && !settings.db) return false

    const dirPath = path.join(settings.rootPath, defaults.folders[name])
    const msg = `"${name}" folder does not exist.`

    if (!isDir(dirPath)) return terminate(chalk.red(msg))

    return false
  })

  // Define a public Dir for static content
  app.use(express.static(path.join(settings.rootPath, defaults.folders.public)))

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
  app.use(cors(settings.cors))

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

  // TODO LOAD OUTSIDE
  // const modelsPath = path.join(settings.rootPath, settings.modelsFolder)
  // const models = settings.db && getModels(modelsPath, mongoose)

  // Add common settings / objects
  // to request object and make
  // then available to other routes
  app.use((req, res, next) => {
    req.xp = {
      settings,
      statusCode: HTTPStatus,
      jwt
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
    // Not found error handler
    app.use(notFoundHandler)

    // General error handler
    app.use(generalErrorhandler)

    server = app.listen(settings.port, settings.address, () => {
      const { address, port } = server.address()
      console.log(chalk.green(`Server running → ${address}:${port} @ ${settings.env}`))
    })
  }

  /**
   * stopServer
   */
  app.stopServer = () => server.close()

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
