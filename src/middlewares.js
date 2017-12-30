/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'

import { validationError, generalError } from './error-handlers'
import validatejs from './validate'

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
 * Request body validator
 */
export const validate = schema => (req, res, next) => {
  // Extract labels
  const labels = Object.keys(schema).reduce((obj, item) => {
    const label = { [item]: schema[item].label }
    return Object.assign({}, obj, label)
  }, {})

  // Extract rules
  const constrains = Object.keys(schema).reduce((obj, item) => {
    const rule = { [item]: schema[item].rules }
    return Object.assign({}, obj, rule)
  }, {})

  const successFn = (attr) => {
    req.body = attr
    req.labels = labels
    req.constrains = constrains

    next()
  }

  const errorFn = (err) => {
    try {
      if (err instanceof Error) throw generalError()

      throw validationError(err.reduce((obj, item) => {
        const name = item.attribute
        const formattedItem = {
          [name]: {
            message: `${labels[name]} ${item.error}`,
            validator: item.validator
          }
        }
        return Object.assign({}, obj, formattedItem)
      }, {}))
    } catch (e) { next(e) }
  }

  validatejs.async(req.body, constrains).then(successFn, errorFn)
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
