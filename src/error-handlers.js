/**
 * Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import boom from 'boom'
import logger from './logger'

/**
 * mongooseErrorHandler
 *
 * Express middleware to handle
 * all kind of mongoose errors thrown
 */
export const mongooseErrorHandler = (err, req, res, next) => {
  let error

  if (err && err.name === 'ValidationError') {
    const validation = Object.keys(err.errors).reduce((obj, item) => {
      const validator = err.errors[item].kind
      const label = (req.validatedBody && req.validatedBody.labels[item]) || item

      const formattedItem = {
        [item]: {
          message: (validator === 'unique') ? `${label} is already in use` : err.errors[item].message,
          validator: err.errors[item].kind
        }
      }

      return Object.assign({}, obj, formattedItem)
    }, {})

    error = boom.badData('Invalid data', { validation })
  }

  next(error || err)
}

/**
 * notFoundErrorHandler
 *
 * Format 404 error objects
 */
export const notFoundErrorHandler = (req, res, next) => {
  next(boom.notFound('Not Found'))
}

/**
 * authorizationErrorHandler
 */
export const authorizationErrorHandler = (err, req, res, next) => {
  let error
  if (err.name === 'UnauthorizedError') {
    error = boom.unauthorized(err.message)
  }

  next(error || err)
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

  if (!boom.isBoom(err)) {
    boom.boomify(err, { statusCode: 500 })
  }

  res.status(err.output.statusCode)
  res.json({
    ...err.output.payload,
    ...err.data,
  })
}
