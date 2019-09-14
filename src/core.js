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
import isNumber from 'lodash/isNumber'
import set from 'lodash/set'
import isPlainObject from 'lodash/isPlainObject'
import Joi from '@hapi/joi'

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
 * Execute Joi schema validations
 * and return parsed errors
 */
const validate = (value, schema) => {
  // Ensure schema is a valid object
  ndtk.assert((schema && schema.isJoi) || isPlainObject(schema), 'Validate error: the schema provided is not a valid object')
  const validSchema = schema.isJoi ? schema : Joi.object(schema)

  const result = Joi.validate(value, validSchema, { stripUnknown: true, abortEarly: false })

  if (result.error) {
    const { details } = result.error

    const error = details.reduce((obj, current) => {
      const { message, type, path } = current
      set(obj, path.map(item => (isNumber(item) ? `[${item}]` : item)), { message: message.replace(/"/g, ''), type })
      return obj
    }, {})

    return { error }
  }

  return { value: result.value }
}

/**
 * Execute body/params/query validations
 * and throw formatted error objects for possible errors
 * or append sanitized data to the request object
 */
const validateRequest = (source, schema) => {
  ndtk.assert(isString(source), 'Validate error: source is not a string')

  const validSource = ['body', 'params', 'query'].includes(source)
  ndtk.assert(validSource, 'Validate error: bad validation source, possible options are "body", "params", "query"')

  return (req, res, next) => {
    // First check for empty payloads
    if (!req[source]) throw ndtk.httpError(422, { message: `Request ${source} data is missing`, type: 'VALIDATION' })

    const { value, error } = validate(req[source], schema)

    if (error) {
      throw ndtk.httpError(422, { message: `Invalid request ${source} data`, type: 'VALIDATION', attributes: error })
    }

    // Reassign sanitized data back
    // to the request object ( with unknown keys removed )
    req[source] = value
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
  validateRequest,
  validate,
}
