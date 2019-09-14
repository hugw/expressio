/**
 * Expressio
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'
import ndtk from 'ndtk'
import dotenv from 'dotenv'
import semver from 'semver'

import 'express-async-errors'

import utils from '@/utils'
import logger from '@/logger/initializer'
import core from '@/core'
import events from '@/events'

/**
 * Expressio
 */
export default function expressio(opts) {
  // Load default options if provided
  const defaults = ndtk.merge({ root: null, name: null }, opts)

  // Attempt to get the current caller
  // directly, if none is provided, and use that as the root
  // of the application to enforce an opinated folder structure.
  const root = defaults.root || ndtk.ccd()
  ndtk.assert(root && ndtk.isDir(root), 'Application root path is invalid.')

  // Load environment variables
  dotenv.config()

  // Load config variables
  const config = utils.config(`${root}/config`, './config')

  // Ensure the current Node version installed is supported
  ndtk.assert(semver.gte(process.version, semver.coerce(config.core.engine)), 'Current Node version is not supported.')

  // Create a new Express server instance
  const server = express()

  // Extend initialize function
  server.initialize = core.initialize

  // Expose config object
  server.config = config

  // Expose root path
  server.root = root

  // Define the server environment
  server.set('env', config.core.env)
  server.env = config.core.env

  // Parse incoming requests
  // to JSON format
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  // Add GZIP compression support
  // for HTTP responses
  server.use(compress())

  // Security
  // (CORS & HTTP Headers)
  server.use(helmet())
  server.use(cors(config.core.cors))

  // Load core initializers
  server.initialize('logger', logger)
  server.initialize('events', events)

  // Set server instance
  // initial value
  server.instance = null

  /**
   * Start server
   */
  server.start = async () => {
    if (server.instance) return

    try {
      server.use(core.notFoundHandler)

      // Emit "beforeStart" events
      // to possibly register custom
      // error handlers
      await server.events.emit('beforeStart')

      server.use(core.generalErrorHandler)

      await new Promise((res) => {
        // Start a new server instance
        server.instance = server.listen(config.core.port, config.core.address, async () => {
          const { address, port } = server.instance.address()
          server.logger.info(`Server running → ${address}:${port} @ ${server.env}`)

          // Emit "afterStart" events
          await server.events.emit('afterStart')

          res()
        })
      })
    } catch (err) {
      server.logger.error(err)
    }
  }

  /**
   * Stop server
   */
  server.stop = async () => {
    try {
      if (!server.instance) return
      // Emit "beforeStop" events
      await server.events.emit('beforeStop')
      // Close server instance
      server.instance.close()
      // Emit "afterStop" events
      await server.events.emit('afterStop')
      // Reset server instance
      server.instance = null
    } catch (err) {
      ndtk.assert(false, err)
    }
  }

  return server
}

/**
 * Expose external
 * dependencies and utility
 * functions
 */
const router = express.Router
const { httpError, assert } = ndtk
const { validate, validateRequest } = core
const { sanitize } = utils

export {
  router,
  httpError,
  validate,
  validateRequest,
  assert,
  sanitize,
}
