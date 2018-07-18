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
import path from 'path'
import dotenv from 'dotenv'

import utils from '@/utils'
import logger from '@/logger'
import mailer from '@/mailer'
import core from '@/core'
import jwt from '@/jwt'

/**
 * Expressio
 */
export default function expressio(opts) {
  // Load default options if provided
  const defaults = ndtk.merge({ root: null }, opts)

  // Attempt to get the current caller
  // directly if none is provided and use that as the root
  // of the application to force an opinated folder structure
  const root = defaults.root || ndtk.ccd()
  ndtk.assert(root && ndtk.isDir(root), 'Application root path is invalid.')

  // Load environment variables
  dotenv.config({ path: path.join(root, '.env') })

  // Load config variables
  const config = utils.config(`${root}/config`, './config')

  // Ensure the current Node version installed is supported
  ndtk.assert(ndtk.supported(config.engine), 'Current Node version is not supported.')

  // Create a new Express server instance
  const server = express()

  // Extend initialize function
  server.initialize = core.initialize

  // Expose config object
  server.config = config

  // Define the server environment
  server.set('env', config.env)

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
  server.use(cors(config.cors))

  // Add core initializers
  // @TODO Organize iniializers in their own folder (plugins?)
  server.initialize('logger', logger)
  server.initialize('mailer', mailer)
  server.initialize('jwt', jwt)

  /**
   * Start server
   */
  server.start = async () => {
    if (server.instance) return

    // Ensure not found routes
    // are handled properly
    server.use(core.notFoundHandler)

    // Emit "preStart" events
    // to possibly register custom
    // error handlers
    server.emit('preStart')

    server.use(core.generalErrorHandler)

    await new Promise((res) => {
      // Start a new server instance
      server.instance = server.listen(config.port, config.address, () => {
        const { address, port } = server.instance.address()
        server.logger.info(`Server running → ${address}:${port} @ ${config.env}`)

        // Emit "postStart" events
        server.emit('postStart')

        res()
      })
    })
  }

  /**
   * Stop server
   */
  server.stop = () => {
    if (!server.instance) return
    // Emit "preStop" events
    server.emit('preStop')
    // Close server instance
    server.instance.close()
    // Emit "postStop" events
    server.emit('postStop')
    // Reset server instance
    server.instance = null
  }

  return server
}

/**
 * Expose external
 * dependencies and utility
 * functions
 */
const router = express.Router
const { httpError } = ndtk
const { validate } = core

export {
  router,
  httpError,
  validate,
}
