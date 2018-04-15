/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'
import capitalize from 'lodash/capitalize'
import mapValues from 'lodash/mapValues'
import validatejs from './validate'
import { httpError } from './utils'

/**
 * controller
 *
 * Add async support and base
 * error handling for common routes
 */
export const controller = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/**
 * getValidationErrors
 */
export const getValidationErrors = (err, labels) => err.reduce((obj, item) => {
  const name = item.attribute
  const formattedItem = {
    [name]: {
      message: `${labels[name]} ${item.error}`,
      validator: item.validator
    }
  }
  return Object.assign({}, obj, formattedItem)
}, {})

/**
 * validateRequest
 *
 * Request body/param/query validator
 */
export const validateRequest = (req, type) => async (schema) => {
  const labels = mapValues(schema, item => item.label)
  const constrains = mapValues(schema, item => item.rules)

  try {
    const attr = await validatejs.async(req[type], constrains)
    const resObj = `validated${capitalize(type)}`
    req[resObj] = { data: attr, labels, constrains }

    return attr
  } catch (err) {
    if (err instanceof Error) {
      throw httpError()
    }

    const errors = getValidationErrors(err, labels)
    throw httpError(422, { message: `Invalid ${type} data`, type: 'validation', errors })
  }
}

/**
 * validate
 *
 * Setup validate api via
 * middleware
 */
export const validate = (req, res, next) => {
  req.validateBody = validateRequest(req, 'body')
  req.validateParams = validateRequest(req, 'params')
  req.validateQuery = validateRequest(req, 'query')

  next()
}

/**
 * configuration
 *
 * Alternatively allow
 * config to be available via req object
 */
export const configuration = config => (req, res, next) => {
  req.config = config
  next()
}

/**
 * authorize
 *
 * Authorize requests based
 * on JWT Tokens
 */
export const authorize = opts => (req, res, next) => {
  const { secret } = req.config
  const unless = opts && opts.ignore && { path: opts.ignore }
  const fn = ejwt({ secret }).unless(unless)
  return fn(req, res, next)
}
