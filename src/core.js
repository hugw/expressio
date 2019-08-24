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
import isPlainObject from 'lodash/isPlainObject'
import Joi from '@hapi/joi'

import './asyncErrors'

/**
 * Load initializers
 */
function initialize(name, fn) {
  const server = this

  ndtk.assert(isString(name) && name.length !== 0, 'Initialize error: name is not a string')
  ndtk.assert(isFunction(fn), `Initialize error: "${name}" has not a valid function`)

  fn(server)
}

/**
 * Execute body/params/query validations
 * and throw formatted error objects for possible errors
 * or append sanitized data to the request object
 */
const validate = (source, schema) => {
  ndtk.assert(isString(source), 'Validate error: source is not a string')

  // Ensure schema is a valid object
  ndtk.assert((schema && schema.isJoi) || isPlainObject(schema), 'Validate error: schema provided is not an object')
  const validSchema = schema.isJoi ? schema : Joi.object(schema)

  const validSource = ['body', 'params', 'query'].includes(source)
  ndtk.assert(validSource, 'Validate error: bad validation source, possible options are "body", "params", "query"')

  return (req, res, next) => {
    // First check for empty payloads
    if (!req[source]) throw ndtk.httpError(422, { message: `Request ${source} data is missing`, type: 'VALIDATION' })

    const result = Joi.validate(req[source], validSchema, { stripUnknown: true, abortEarly: false })

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
 * Format all caught errors
 * and return an http error object
 */
const generalErrorHandler = (err, req, res, next) => { // eslint-disable-line
  const { logger } = req.app

  // For the purpose of logging at least a message
  err.message = err.message || 'Something bad happened'

  const { output } = err.isHttp ? err : ndtk.httpError()
  if (output.status >= 500) logger.error(err)

  res.status(output.status)
  res.json({ ...output })
}

/**
 * Format not found routes
 * to return a 404 response
 */
const notFoundHandler = (req, res, next) => next(ndtk.httpError(404))

export default {
  initialize,
  generalErrorHandler,
  notFoundHandler,
  validate,
}
