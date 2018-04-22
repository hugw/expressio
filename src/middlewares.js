/**
 * Middlewares
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import ejwt from 'express-jwt'
import mapValues from 'lodash/mapValues'
import intersection from 'lodash/intersection'
import validatejs from './validate'
import { httpError } from './utils'

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
export const validateRequest = async (schema, data, type) => {
  const labels = mapValues(schema, item => item.label)
  const constrains = mapValues(schema, item => item.rules)

  try {
    const attr = await validatejs.async(data, constrains)

    return {
      data: attr,
      labels,
      constrains,
      type
    }
  } catch (err) {
    if (err instanceof Error) {
      throw httpError(500, { message: err.message })
    }

    const errors = getValidationErrors(err, labels)
    throw httpError(422, { message: `Invalid ${type} data`, type: 'validation', errors })
  }
}

/**
 * controller
 *
 * Add async support and base
 * error handling for common routes
 */
export const controller = resource => async (req, res, next) => {
  const { validate, handler } = resource
  if (!handler) return next()

  try {
    if (validate) {
      const types = intersection(Object.keys(validate), ['body', 'params', 'query'])
      const validations = types.map(type => validateRequest(validate[type], req[type], type))
      const results = await Promise.all(validations)

      results.forEach((result) => {
        const {
          type,
          labels,
          contrains,
          data
        } = result

        req[type] = data
        req.validation = {
          ...req.validation || {},
          [type]: { labels, contrains }
        }
      })
    }

    await resource.handler(req, res, next)
  } catch (e) { next(e) }
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
