/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import joi from 'joi'
import { IS_DEV } from 'isenv'
import ejwt from 'express-jwt'
import HTTPStatus from 'http-status'

import { validationError, generalError } from './error-handlers'

/**
 * controller
 *
 * Add async support and base
 * error handling for common routes
 */
export const controller = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

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
    const error = validationError(err && err.details.reduce((obj, i) => {
      const item = { [i.context.key]: i.message.replace(/"/g, '') }
      return Object.assign({}, obj, item)
    }, {}))

    if (!err) req.body = value

    next(err && error)
  })
}

export const mongooseErrorHandler = (err, req, res, next) => {
  let error

  if (err && err.name === 'ValidationError') {
    error = validationError(Object.keys(err.errors).reduce((obj, i) => {
      const item = { [i]: err.errors[i].message }
      return Object.assign({}, obj, item)
    }, {}))
  }

  next(error || err)
}

/**
 * notFoundHandler
 *
 * Format 404 error objects
 */
export const notFoundHandler = () => {
  throw generalError(404)
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
    message: err.message || HTTPStatus[500],
    statusCode: err.status,
    ...err.data,
    ...stack ? { stack } : {}
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

/**
 * schemaOpts
 *
 * Add global options for
 * mongoose schemas
 */
export const schemaOpts = (schema) => {
  const toOpts = {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id // eslint-disable-line
      delete ret.__v // eslint-disable-line

      if (schema.options.filter) {
        schema.options.filter.forEach((key) => {
          delete ret[key] // eslint-disable-line
        })
      }
    }
  }

  schema.set('timestamps', true)
  schema.set('minimize', false)
  schema.set('toJSON', toOpts)
  schema.set('toObject', toOpts)
}
