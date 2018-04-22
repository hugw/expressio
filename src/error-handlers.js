/**
 * Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import get from 'lodash/get'
import logger from './logger'
import { httpError } from './utils'

/**
 * mongooseErrorHandler
 *
 * Express middleware to handle
 * all kind of mongoose errors thrown
 */
export const mongooseErrorHandler = (err, req, res, next) => {
  if (err && err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).reduce((obj, item) => {
      const validator = err.errors[item].kind
      const label = get(req, `validation.body.labels.${item}`, item)

      const formattedItem = {
        [item]: {
          message: (validator === 'unique') ? `${label} is already in use` : err.errors[item].message,
          validator: err.errors[item].kind
        }
      }

      return Object.assign({}, obj, formattedItem)
    }, {})

    return next(httpError(422, { message: 'Invalid data', type: 'validation', errors }))
  }

  next(err)
}

/**
 * sequelizeErrorHandler
 *
 * Express middleware to handle
 * all kind of mongoose errors thrown
 */
export const sequelizeErrorHandler = (err, req, res, next) => {
  if (err && err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.fields.reduce((obj, item) => {
      const label = get(req, `validation.body.labels.${item}`, item)

      const formattedItem = {
        [item]: {
          message: `${label} is already in use`,
          validator: 'unique'
        }
      }

      return Object.assign({}, obj, formattedItem)
    }, {})

    return next(httpError(422, { message: 'Invalid data', type: 'validation', errors }))
  }

  next(err)
}

/**
 * notFoundErrorHandler
 *
 * Format 404 error objects
 */
export const notFoundErrorHandler = (req, res, next) => next(httpError(404))

/**
 * authorizationErrorHandler
 */
export const authorizationErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    const authError = httpError(401, {
      message: err.message,
      type: err.name
    })
    return next(authError)
  }

  next(err)
}

/**
 * generalErrorHandler
 *
 * Format all caught errors
 * and expose some properties based
 * on current environment
 */
export const generalErrorHandler = (err, req, res, next) => { // eslint-disable-line
  logger.warn(err)
  const resError = err.isHttp ? err.output : httpError().output

  res.status(resError.status)
  res.json({ ...resError })
}
