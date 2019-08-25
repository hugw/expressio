/**
 * Logger initializer
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import * as winston from 'winston'
import Joi from '@hapi/joi'
import ndtk from 'ndtk'

import utils from '@/utils'
import formatter from './formatter'
import middleware from './middleware'
import output from './output'

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  level: Joi.string().required(), // @TODO Allow only npm level strings
  silent: Joi.boolean().required(),
  prettify: Joi.boolean().required(),
  transports: Joi.array().items(Joi.string().required()).required(),
})

export default (server) => {
  const { config } = server

  const {
    level,
    silent,
    prettify,
    transports,
  } = utils.sanitize(config.core.logger, schema, 'Invalid Logger config')

  // Setup Winston logger instance
  const instance = winston.createLogger({
    level: 'info',
    format: output,
  })

  // Define available transports
  const availableTransports = {
    console: new winston.transports.Console(),
    file: new winston.transports.File({ filename: `logs/${server.env}.log` }),
  }

  // Add allowed transports to Winston
  transports.forEach((name) => {
    const transport = availableTransports[name]
    ndtk.assert(transport, `Logger Error: Transport "${transport}" not found.`)
    instance.add(transport)
  })

  // Setup Winston configs
  instance.level = level
  instance.silent = silent

  // Expose Logger API to the server object
  server.logger = {
    instance,
    transports: winston.transports,
    ...['error', 'warn', 'info', 'verbose', 'silly', 'debug'].reduce((acc, cur) => ({
      ...acc,
      [cur]: (...args) => {
        const strings = args.map(arg => formatter(arg, { prettify }))
        instance[cur](strings.join(' '))
      },
    }), {}),
  }

  // Log request/response info
  server.use(middleware)
}
