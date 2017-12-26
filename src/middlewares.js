/**
 * Middlewares & Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import joi from 'joi'
import { IS_DEV } from 'isenv'
import ejwt from 'express-jwt'

import { reqError } from './utils'

/**
 * validate
 *
 * Body validator/Sanitizer
 */
export const validate = schema => (req, res, next) => {
  const options = {
    abortEarly: false
  }

  joi.validate(req.body, schema, options, (err, value) => {
    const error = reqError(400, {
      errors: err && err.details.reduce((obj, i) => {
        const item = { [i.context.key]: i.message.replace(/"/g, '') }
        return Object.assign({}, obj, item)
      }, {})
    })

    if (!err) req.body = value

    next(err && error)
  })
}

export const mongooseErrorHandler = (err, req, res, next) => {
  let error

  if (err && err.name === 'ValidationError') {
    error = reqError(400, {
      errors: Object.keys(err.errors).reduce((obj, i) => {
        const item = { [i]: err.errors[i].message }
        return Object.assign({}, obj, item)
      }, {})
    })
  }

  next(error || err)
}

/**
 * notFoundHandler
 *
 * Format 404 error objects
 */
export const notFoundHandler = (req, res, next) => next(reqError(404))

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
