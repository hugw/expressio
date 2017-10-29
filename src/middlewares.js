/**
 * Middlewares & Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import HTTPStatus from 'http-status'
import joi from 'joi'
import { IS_DEV } from 'isenv'

/**
 * asyncRoute
 *
 * Add async/await support
 * for app routes
 */
export const asyncRoute = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

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
    const error = new Error(HTTPStatus[400])

    error.status = 400
    error.data = {
      validation: err && err.details.map(i => ({
        path: i.path.join('.'),
        type: i.type,
        key: i.context.key,
        message: i.message.replace(/"/g, ''),
        label: (i.context.label !== i.context.key) ? i.context.label : ''
      }))
    }

    if (!err) req.body = value

    next(err && error)
  })
}

/**
 * notFoundHandler
 *
 * Format 404 error objects
 */
export const notFoundHandler = (req, res, next) => {
  const err = new Error(HTTPStatus[404])
  err.status = 404
  next(err)
}

/**
 * mongooseErrorHandler
 *
 * Format mongoose validation
 * error objects
 */
export const mongooseErrorHandler = (err, req, res, next) => {
  let error

  if (err && err.name === 'ValidationError') {
    error = new Error(HTTPStatus[400])
    error.status = 400

    error.data = {
      validation: Object.keys(err.errors).map(i => ({
        path: err.errors[i].path,
        type: err.errors[i].kind,
        key: i,
        message: err.errors[i].message,
        label: ''
      }))
    }
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
export const generalErrorhandler = (err, req, res, next) => { // eslint-disable-line
  const stack = err.stack && err.stack.split('\n')
  res.status(err.status || 500)

  res.json({
    error: err.message,
    statusCode: err.status,
    ...err.data,
    stack: (IS_DEV && stack) || ''
  })
}
