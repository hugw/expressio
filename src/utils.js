/**
 * Utility Functions
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import ndtk from 'ndtk'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import Joi from '@hapi/joi'

/**
 * Helper for loading
 * app and default config objects
 */
const config = (name, defaults) => ndtk.config(ndtk.req(name), ndtk.req(defaults))

/**
 * Validate object schemas
 * using Joi validator
 */
const sanitize = (object, schema, message) => {
  // Ensure schema is a valid Joi object
  ndtk.assert(schema && schema.isJoi, 'Sanitize error: schema provided is not a valid Joi schema')

  // Ensure object is valid
  ndtk.assert(isPlainObject(object), 'Sanitize error: object provided is not valid')

  const result = Joi.validate(object, schema, { stripUnknown: true })
  const errMessage = isString(message) ? message : 'Invalid config'

  if (result.error) ndtk.assert(false, `${errMessage}: ${result.error.details[0].message}`)

  return result.value
}

export default { config, sanitize }
