/**
 * Error handlers test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import {
  notFoundErrorHandler,
} from '../error-handlers'

describe('Expressio / Error Handlers', () => {
  describe('#notFoundErrorHandler', () => {
    it.skip('should return a 404 Boom error object', () => {
      const err = notFoundErrorHandler()

      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('The requested endpoint was not found')
      expect(err.output.payload.statusCode).toEqual(404)
    })
  })
})
