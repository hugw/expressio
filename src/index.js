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
import mongoose from 'mongoose'
import joi from 'joi'
import beautifyUnique from 'mongoose-beautiful-unique-validation'
import jwt from 'jsonwebtoken'
import { IS_DEV } from 'isenv'

import defaultSettings from './settings'

import {
  isNodeSupported,
  isDir,
  terminate,
  getModels
} from './utils'

import {
  asyncRoute,
  validate,
  authorize,
  notFoundHandler,
  generalErrorhandler,
  mongooseErrorHandler
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

  const settings = Object.assign({}, defaultSettings, appSettings)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(settings.reqNode)) {
    return terminate(chalk.red('Current Node version is not supported.'))
  }

  // Check if current settings
  // paths are valid directories
  ['publicFolder', 'modelsFolder'].forEach((name) => {
    // Check if models dir is first necessary
    if (name === 'modelsFolder' && !settings.db) return false

    const dirPath = path.join(settings.rootPath, settings[name])
    const msg = `"${dirPath}" does not exist.\n` +
    `Please check your "${name}" settings.`

    if (!isDir(dirPath)) return terminate(chalk.red(msg))

    return false
  })

  // Define a public Dir for
  // static content
  app.use(express.static(path.join(settings.rootPath, settings.publicFolder)))

  // Parse incomming requests to
  // JSON format
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
        new winston.transports.Console({
          colorize: true,
          prettyPrint: true,
        })
      ],
      expressFormat: true,
      colorize: true,
      responseWhitelist: ['statusCode', 'body'],
      requestWhitelist: [
        'url',
        'headers',
        'method',
        'httpVersion',
        'originalUrl',
        'query',
        'body'
      ]
    }))
  }

  // Attach common settings
  // to req object
  app.use((req, res, next) => {
    const modelsPath = path.join(settings.rootPath, settings.modelsFolder)
    const models = settings.db && getModels(modelsPath)

    req.settings = settings
    req.models = models
    next()
  })

  /**
   * startServer
   *
   * Bootstrap server and
   * error handlers
   */
  app.startServer = () => {
    // Not found error handler
    app.use(notFoundHandler)

    // Mongoose error handler
    app.use(mongooseErrorHandler)

    // General error handler
    app.use(generalErrorhandler)

    // Server start
    const startExpress = () => {
      server = app.listen(settings.port, settings.address, () => {
        const { address, port } = server.address()
        console.log(chalk.green(`Server running → ${address}:${port} @ ${settings.env}`))
      })
    }

    // Mongo initialization
    if (settings.db) {
      mongoose.connect(settings.db[settings.env], { useMongoClient: true })
      mongoose.connection.on('error', err => terminate(chalk.red(err.message)))
      mongoose.connection.once('open', () => {
        console.log(chalk.green(`Mongo connected @ ${settings.env}`))
        startExpress()
      })
    } else startExpress()
  }

  /**
   * stopServer
   */
  app.stopServer = () => server.close()

  return app
}

/**
 * Expose common objects
 * to be used without the need
 * to setup dependecies twice
 */
mongoose.Promise = global.Promise
mongoose.plugin(beautifyUnique)

export { express, mongoose, joi, HTTPStatus, jwt, authorize }

/**
 * Expose middlewares
 */
export { asyncRoute, validate }
