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
      const label = (req.labels && req.labels[item]) || item

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
export const notFoundErrorHandler = () => boom.notFound('The requested endpoint was not found')

/**
 * generalErrorHandler
 *
 * Format all caught errors
 * and expose some properties based
 * on current environment
 */
export const generalErrorHandler = (err, req, res, next) => { // eslint-disable-line
  logger.error(err)

  if (!boom.isBoom(err)) {
    boom.boomify(err, { statusCode: 500 })
  }

  res.status(err.output.statusCode)
  res.json({
    ...err.output.payload,
    ...err.data,
  })
}
