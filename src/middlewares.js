/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import joi from 'joi'
import ejwt from 'express-jwt'

import { validationError } from './error-handlers'

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
