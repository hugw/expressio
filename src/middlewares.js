/**
 * Middlewares & Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import HTTPStatus from 'http-status'
import joi from 'joi'
import { IS_DEV } from 'isenv'
import ejwt from 'express-jwt'

/**
 * validate
 *
 * Body validator/Sanitizer
 */
export const validate = schema => (req, res, next) => {
  const { statusCode } = req.xp

  const options = {
    abortEarly: false
  }

  joi.validate(req.body, schema, options, (err, value) => {
    const error = new Error(statusCode[400])

    error.status = 400
    error.data = {
      errors: err && err.details.map(i => ({
        [i.context.key]: i.message.replace(/"/g, ''),
      }))
    }

    if (!err) req.body = value

    next(err && error)
  })
}

/**
 * notFoundHandler
 *
 * Format 404 error objects
 */
export const notFoundHandler = (req, res, next) => {
  const err = new Error(HTTPStatus[404])
  err.status = 404
  next(err)
}

/**
 * generalErrorHandler
 *
 * Format all caught errors
 * and expose some properties based
 * on current environment
 */
export const generalErrorhandler = (err, req, res, next) => { // eslint-disable-line
  const stack = IS_DEV && err.stack && err.stack.split('\n')
  res.status(err.status || 500)

  res.json({
    message: err.message,
    statusCode: err.status,
    ...err.data,
    ...stack || {}
  })
}

/**
 * authorize
 *
 * Authorize requests based
 * on JWT Tokens
 */
export const authorize = (req, res, next) => {
  const {
    config: {
      secret,
      authorization: { ignorePaths, enabled }
    }
  } = req.xp

  if (!enabled) return next()

  const fn = ejwt({ secret }).unless(ignorePaths.length && { path: ignorePaths })
  return fn(req, res, next)
}
