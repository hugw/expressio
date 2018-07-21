/**
 * Core
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import ndtk from 'ndtk'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import Joi from 'joi'
import Layer from 'express/lib/router/layer'

/**
 * Load initializers
 */
function initialize(name, fn) {
  const server = this

  ndtk.assert(isString(name) && name.length !== 0, 'Initialize error: name is not a string')
  ndtk.assert(isFunction(fn), `Initialize error: "${name}" has not a valid function`)

  // If no valid config is found, then return
  // an empty object as the second arg
  fn(server, server.config[name] || {})
}

/**
 * Execute body/params/query validations
 * and throw formatted error objects for possible errors
 * or append sanitized data to the request object
 */
const validate = (source, schema) => {
  ndtk.assert(isString(source), 'Validate error: source is not a string')

  // Ensure schema is a valid Joi object
  ndtk.assert(schema && schema.isJoi, 'Validate error: schema provided is not a valid Joi schema')

  const validSource = ['body', 'params', 'query'].includes(source)
  ndtk.assert(validSource, 'Validate error: bad validation source, possible options are "body", "params", "query"')

  return (req, res, next) => {
    // First check for empty payloads
    if (!req[source]) throw ndtk.httpError(422, { message: `Request ${source} data is missing`, type: 'VALIDATION' })

    const result = Joi.validate(req[source], schema, { stripUnknown: true, abortEarly: false })

    if (result.error) {
      const { details } = result.error

      const attributes = details.reduce((obj, validation) => {
        const { context: { key }, message, type } = validation
        return Object.assign({}, obj, { [key]: { message: message.replace(/"/g, ''), type } })
      }, {})

      throw ndtk.httpError(422, { message: `Invalid request ${source} data`, type: 'VALIDATION', attributes })
    }

    // Reassign sanitized data back
    // to the request object ( with unknown keys removed )
    req[source] = result.value
    next()
  }
}

/**
 * Controller middleware
 * to handle async errors
 */
const controller = (resource) => {
  ndtk.assert(isFunction(resource), 'Controller error: resource is not a function')

  return async (req, res, next) => {
    try {
      await resource(req, res, next)
    } catch (e) { next(e) }
  }
}

/**
 * Format all caught errors
 * and return an http error object
 */
const generalErrorHandler = (err, req, res, next) => { // eslint-disable-line
  // For the purpose of logging at least a message
  err.message = err.message || 'Something bad happened'

  const { output } = err.isHttp ? err : ndtk.httpError()
  if (output.status >= 500) req.logger.error(err)

  res.status(output.status)
  res.json({ ...output })
}

/**
 * Format not found routes
 * to return a 404 response
 */
const notFoundHandler = (req, res, next) => next(ndtk.httpError(404))

/**
 * Auto asyncfy all routes
 * instead of having to rely on
 * using "controller" manually
 *
 * @link https://github.com/davidbanham/express-async-errors
 */
Object.defineProperty(Layer.prototype, 'handle', {
  get() { return this.fn },
  set(fn) {
    // Ignore error handlers and non async functions
    this.fn = (fn.length !== 4 && fn.constructor.name === 'AsyncFunction') ? controller(fn) : fn
  },
})

export default {
  initialize,
  controller,
  generalErrorHandler,
  notFoundHandler,
  validate,
}
