/**
 * Error handlers test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */


import {
  generalError,
  validationError,
  notFoundHandler,
  generalErrorhandler,
  mongooseErrorHandler
} from '../error-handlers'

describe('Expressio / Error Handlers', () => {
  it('should expose express error handlers', () => {
    expect(notFoundHandler).toBeDefined()
    expect(generalErrorhandler).toBeDefined()
    expect(mongooseErrorHandler).toBeDefined()
  })

  describe('#generalError', () => {
    it('should generate an error object with no code & custom data', () => {
      const err = generalError()
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Internal Server Error')
      expect(err.status).toEqual(500)
    })

    it('should generate an error object with no custom data', () => {
      const err = generalError(400)
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
    })

    it('should generate an error object with custom data', () => {
      const err = generalError(400, { foo: 'foo' })
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
      expect(err.data).toEqual({ foo: 'foo' })
    })
  })

  describe('#validationError', () => {
    it('should generate an error object with no custom data', () => {
      const err = validationError()
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
    })

    it('should generate an error object with custom data', () => {
      const err = validationError({ foo: 'foo' })
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
      expect(err.data).toEqual({ errors: { foo: 'foo' } })
    })
  })
})
