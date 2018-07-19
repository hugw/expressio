/**
 * JWT
 *
 * Authorize requests based
 * on JWT Tokens
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import ndtk from 'ndtk'

import utils from '@/utils'

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  enabled: Joi.boolean().required(),
  secret: Joi.string().required(),
  expiresIn: Joi.string().required(),
  algorithm: Joi.string().required(),
})

export default (server, config) => {
  const {
    // @TODO Move secret outside of jwt config object
    secret,
    expiresIn,
    algorithm,
    enabled,
  } = utils.sanitize(config, schema, 'Invalid JWT config')

  if (!enabled) return

  /**
   * Setup JWT authorization
   */
  const setup = (unless = {}) => {
    const fn = ejwt({ secret }).unless(unless)
    server.use(fn)
  }

  /**
   * Create JWT tokens
   * with a given signature
   */
  const sign = (data, opts) => jwt.sign({ data }, secret, { expiresIn, ...opts, algorithm })

  /**
   * Format JWT authorization errors
   */
  const errorHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      const messages = {
        'jwt expired': 'The token provided has expired',
        'invalid signature': 'The token provided is invalid',
        'jwt malformed': 'The token provided is invalid',
        'No authorization token was found': 'Authorization token is missing',
      }

      const authError = ndtk.httpError(401, { message: messages[err.message] || err.message })
      return next(authError)
    }

    return next(err)
  }

  // Expose JWT Api to the server object
  server.jwt = { sign, setup }

  // Expose JWT Api to the request object
  server.use((req, res, next) => {
    req.jwt = { sign }
    next()
  })

  // Register error handler
  server.events.on('preStart', srv => srv.use(errorHandler))
}
