/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'
import boom from 'boom'
import validatejs from './validate'

/**
 * controller
 *
 * Add async support and base
 * error handling for common routes
 */
export const controller = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/**
 * validateRequest
 *
 * Request body/param/query validator
 */
export const validateRequest = (data, type) => async (schema) => {
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

  await validatejs.async(data, constrains).then(attr => ({ data: attr, labels, constrains }), (err) => {
    if (err instanceof Error) {
      throw boom.badImplementation('Something went wrong while validating your data')
    }

    const validation = err.reduce((obj, item) => {
      const name = item.attribute
      const formattedItem = {
        [name]: {
          message: `${labels[name]} ${item.error}`,
          validator: item.validator
        }
      }
      return Object.assign({}, obj, formattedItem)
    }, {})

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
  req.validateBody = validateRequest(req.body)
  req.validateParams = validateRequest(req.params)
  req.validateQuery = validateRequest(req.query)

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
export const authorize = (app, config) => (ignorePaths) => {
  app.use((req, res, next) => {
    const { secret } = config
    const fn = ejwt({ secret }).unless(ignorePaths.length && { path: ignorePaths })
    return fn(req, res, next)
  })
}
