/**
 * Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import HTTPStatus from 'http-status'
import { IS_DEV } from 'isenv'

/**
 * generalError
 *
 * Generate a formatted
 * response error.
 */
export function generalError(code = 500, data) {
  const err = new Error(HTTPStatus[code])
  err.status = code
  err.data = data

  return err
}

/**
 * validationError
 */
export function validationError(data) {
  return generalError(400, { errors: data })
}

/**
 * mongooseErrorHandler
 *
 * Express middleware to handle
 * all kind of mongoose errors thrown
 */
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
