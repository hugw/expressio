/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'
import boom from 'boom'
import capitalize from 'lodash/capitalize'
import validatejs from './validate'

/**
 * controller
 *
 * Add async support and base
 * error handling for common routes
 */
export const controller = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/**
 * getSchemaLabels
 */
export const getSchemaLabels = schema => Object.keys(schema).reduce((obj, item) => {
  const label = { [item]: schema[item].label }
  return Object.assign({}, obj, label)
}, {})

/**
 * getSchemaConstrains
 */
export const getSchemaConstrains = schema => Object.keys(schema).reduce((obj, item) => {
  const rule = { [item]: schema[item].rules }
  return Object.assign({}, obj, rule)
}, {})

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
  const labels = getSchemaLabels(schema)
  const constrains = getSchemaConstrains(schema)

  return validatejs.async(req[type], constrains).then((attr) => {
    const name = `validated${capitalize(type)}`
    req[name] = { data: attr, labels, constrains }

    return attr
  }, (err) => {
    if (err instanceof Error) {
      throw boom.badImplementation('Something went wrong while validating your data')
    }

    const validation = getValidationErrors(err, labels)

    throw boom.badData(`Invalid ${type} data`, { validation })
  })
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
export const authorize = (app, config) => ({ unless = null }) => {
  app.use((req, res, next) => {
    const { secret } = config
    const fn = ejwt({ secret }).unless(unless)
    return fn(req, res, next)
  })
}
