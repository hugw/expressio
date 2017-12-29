/**
 * Error Handlers
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import HTTPStatus from 'http-status'

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
