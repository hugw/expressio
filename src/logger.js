/**
 * Logger
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import winston from 'winston'
import winstonExp from 'express-winston'

// Main logger
const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)({ colorize: true, prettyPrint: true, }),
  ]
})

export const loggerMiddleware = winstonExp.logger({
  transports: [
    new winston.transports.Console({ colorize: true, prettyPrint: true, })
  ],
  expressFormat: true,
  colorize: true,
  responseWhitelist: ['statusCode', 'body'],
  requestWhitelist: [ // @TODO Add options to configs
    'url',
    'headers',
    'method',
    'httpVersion',
    'originalUrl',
    'query',
    'body'
  ]
})

export default logger
