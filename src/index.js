/**
 * Expressio
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

/* eslint no-console: 0 */
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'
import HTTPStatus from 'http-status'
import chalk from 'chalk'
import winstonExp from 'express-winston'
import winston from 'winston'
import { IS_DEV, CURRENT_ENV } from 'isenv'

import { isNodeSupported, hasPublicDir, terminate } from './utils'

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

  // Setup settings
  const defaultSettings = {
    env: CURRENT_ENV,
    port: 4000,
    address: '127.0.0.1',
    reqNode: { minor: 6, major: 8 },
    publicDir: null,
  }

  const settings = Object.assign({}, defaultSettings, appSettings)

  // Check if current Node version
  // installed is supported
  if (!isNodeSupported(settings.reqNode)) {
    return terminate(chalk.red('Current Node version is not supported.'))
  }

  // Check if current settings
  // has a valid public directory path set
  if (!hasPublicDir(settings.publicDir)) {
    return terminate(chalk.red('"publicDir" path is not valid.'))
  }

  // Define a public folder for
  // static content
  app.use(express.static(settings.publicDir))

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
  app.use(cors())

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


  /**
   * startServer
   *
   * Bootstrap server and
   * error handlers
   */
  app.startServer = () => {
    // Not found
    // error handler
    app.use((req, res, next) => {
      const err = new Error(HTTPStatus[404])
      err.status = 404
      next(err)
    })

    // General error handler. It will
    // show throw errors based on
    // current environment set
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
      const stack = err.stack && err.stack.split('\n')

      res.status(err.status || 500)
      res.json({
        message: err.message,
        status: err.status,
        stack: (IS_DEV && stack) || ''
      })
    })

    // Server start
    server = app.listen(settings.port, settings.address, () => {
      const { address, port } = server.address()
      const msg = `Server running → ${address}:${port} @ ${settings.env}`
      console.log(chalk.green(msg))
    })
  }

  /**
   * stopServer
   *
   * Kill current server
   * instance.
   */
  app.stopServer = () => server.close()

  return app
}

/**
 * express
 *
 * Expose Express object
 * to be used without having
 * to setup dependecies twice
 */
export { express }
