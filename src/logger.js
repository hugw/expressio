/**
 * Logger
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import { createLogger, transports } from 'winston'
import Joi from 'joi'

import format from '@/loggerFormat'
import utils from '@/utils'

// Setup Winston logger instance
const logger = createLogger({ level: 'info', format, transports: [new transports.Console()] })

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  level: Joi.string().required(),
  silent: Joi.boolean().required(),
  prettify: Joi.boolean().required(),
})

export default (server, config) => {
  const {
    level,
    silent,
    prettify,
  } = utils.sanitize(config, schema, 'Invalid Logger config')

  logger.level = level
  logger.silent = silent
  logger.options = { prettify, env: server.env }

  // Expose Logger API to the server object
  server.logger = logger

  // Expose Logger API to the request object
  server.use((req, res, next) => {
    req.logger = logger
    next()
  })

  // Log request/response info
  server.use((req, res, next) => {
    const startTime = new Date()

    const { end } = res
    res.end = (chunk, encoding) => {
      res.end = end
      res.end(chunk, encoding)

      const { method } = req
      const payload = req.body
      const path = req.originalUrl || req.url
      const time = new Date() - startTime
      const status = res.statusCode
      const size = res._headers['content-length'] // eslint-disable-line
      const type = res._headers['content-type'] // eslint-disable-line
      const body = chunk

      let logLevel = logger.info
      if (status >= 400) logLevel = logger.warn
      if (status >= 500) logLevel = logger.error

      logLevel(null, {
        req: {
          method,
          path,
          status,
          time,
          size,
          type,
          payload,
          response: body,
        },
        options: req.logger.options,
      })
    }

    next()
  })
}
