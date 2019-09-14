import request from 'supertest'
import ndtk from 'ndtk'
import Joi from '@hapi/joi'

import core from '@/core'
import app from './fixtures/core/app'

describe('Expressio / Core Initializer', () => {
  describe('#initialize', () => {
    const fn = jest.fn()

    afterEach(() => {
      fn.mockClear()
    })

    const server = {
      initialize: core.initialize,
    }

    it('should load the initializer with proper params', () => {
      server.initialize('test', fn)
      expect(fn).toHaveBeenCalledWith(server)
    })

    it('given an initializer with invalid name, it should throw an error with proper message', () => {
      expect(() => server.initialize('', fn)).toThrow('Initialize error: name is not a string')
      expect(() => server.initialize(null, fn)).toThrow('Initialize error: name is not a string')
      expect(() => server.initialize(undefined, fn)).toThrow('Initialize error: name is not a string')
      expect(() => server.initialize(2, fn)).toThrow('Initialize error: name is not a string')
      expect(() => server.initialize({}, fn)).toThrow('Initialize error: name is not a string')
    })

    it('given an initializer with invalid function, it should throw an error with proper message', () => {
      expect(() => server.initialize('test', null)).toThrow('Initialize error: "test" has not a valid function')
      expect(() => server.initialize('test', {})).toThrow('Initialize error: "test" has not a valid function')
      expect(() => server.initialize('test', undefined)).toThrow('Initialize error: "test" has not a valid function')
      expect(() => server.initialize('test', 'test')).toThrow('Initialize error: "test" has not a valid function')
      expect(() => server.initialize('test', 10)).toThrow('Initialize error: "test" has not a valid function')
    })
  })

  describe('#validate', () => {
    it('given an invalid schema, it should throw an error with proper message', () => {
      expect(() => core.validate()).toThrow('Validate error: the schema provided is not a valid object')
      expect(() => core.validate(null, null)).toThrow('Validate error: the schema provided is not a valid object')
      expect(() => core.validate(null, undefined)).toThrow('Validate error: the schema provided is not a valid object')
      expect(() => core.validate(null, true)).toThrow('Validate error: the schema provided is not a valid object')
      expect(() => core.validate(null, [])).toThrow('Validate error: the schema provided is not a valid object')
    })

    it('should accept plain objects as valid schema', () => {
      const schema = {
        foo: Joi.boolean().required(),
      }

      expect(core.validate({ foo: true }, schema)).toHaveProperty('value')
    })

    it('should accept joi objects as valid schema', () => {
      const schema = Joi.object({
        foo: Joi.boolean().required(),
      })

      expect(core.validate({ foo: true }, schema)).toHaveProperty('value')
    })

    it('given a schema and valid values, it should return sanitized data', () => {
      const schema = Joi.object({
        bool: Joi.boolean().required(),
        string: Joi.string().required(),
        number: Joi.number().required(),
      })

      const values = {
        bool: true,
        string: 'a string',
        number: 10,
        other: 'should be removed',
      }

      expect(core.validate(values, schema)).toEqual({
        value: {
          bool: true,
          string: 'a string',
          number: 10,
        },
      })
    })

    it('given a schema and invalid values, it should return a formatted error object', () => {
      const schema = Joi.object({
        bool: Joi.boolean().required(),
        string: Joi.string().required(),
        number: Joi.number().required(),
      })

      const values = {
        bool: 'hey',
        string: 10,
        number: 'not a number',
      }

      expect(core.validate(values, schema)).toEqual({
        error: {
          bool: {
            message: 'bool must be a boolean',
            type: 'boolean.base',
          },
          string: {
            message: 'string must be a string',
            type: 'string.base',
          },
          number: {
            message: 'number must be a number',
            type: 'number.base',
          },
        },
      })
    })

    it('given a complex schema and invalid values, it should return a formatted error object', () => {
      const schema = Joi.object({
        bool: Joi.boolean().required(),
        string: Joi.string().required(),
        number: Joi.number().required(),
        array: Joi.array().items({
          arrayBool: Joi.boolean().required(),
          arrayString: Joi.string().required(),
          arrayNumber: Joi.number().required(),
        }).required(),
        object: Joi.object({
          objectBool: Joi.boolean().required(),
          objectString: Joi.string().required(),
          objectNumber: Joi.number().required(),
        }).required(),
      })

      const values = {
        bool: 'hey',
        string: 10,
        array: [{
          arrayBool: true,
          arrayString: 'string',
          arrayNumber: 'not a number',
        }, {
          arrayBool: 'not a boolean',
          arrayNumber: 10,
        }],
        object: {
          objectBool: true,
          objectNumber: 'not a number',
        },
      }

      expect(core.validate(values, schema)).toEqual({
        error: {
          bool: {
            message: 'bool must be a boolean',
            type: 'boolean.base',
          },
          string: {
            message: 'string must be a string',
            type: 'string.base',
          },
          number: {
            message: 'number is required',
            type: 'any.required',
          },
          array: {
            '[0]': {
              arrayNumber: {
                message: 'arrayNumber must be a number',
                type: 'number.base',
              },
            },
            '[1]': {
              arrayBool: {
                message: 'arrayBool must be a boolean',
                type: 'boolean.base',
              },
              arrayString: {
                message: 'arrayString is required',
                type: 'any.required',
              },
            },
          },
          object: {
            objectNumber: {
              message: 'objectNumber must be a number',
              type: 'number.base',
            },
            objectString: {
              message: 'objectString is required',
              type: 'any.required',
            },
          },
        },
      })
    })
  })

  describe('#validateRequest', () => {
    const next = jest.fn()

    afterEach(() => {
      next.mockClear()
    })

    it('given a request with good payload and Joi schema, it should reassign the sanitized data to the request object', () => {
      const schema = Joi.object({
        foo: Joi.boolean().required(),
        bar: Joi.string().trim().required(),
      })

      const req = {
        body: {
          foo: true,
          bar: ' bar ',
          extra: '...',
        },
      }

      const handler = core.validateRequest('body', schema)
      handler(req, null, next)

      expect(next).toHaveBeenCalled()
      expect(req.body).toEqual({ foo: true, bar: 'bar' })
    })

    it('given a request with good payload and plain object schema, it should reassign the sanitized data to the request object', () => {
      const schema = {
        foo: Joi.boolean().required(),
        bar: Joi.string().trim().required(),
      }

      const req = {
        body: {
          foo: true,
          bar: ' bar ',
          extra: '...',
        },
      }

      const handler = core.validateRequest('body', schema)
      handler(req, null, next)

      expect(next).toHaveBeenCalled()
      expect(req.body).toEqual({ foo: true, bar: 'bar' })
    })

    it('given an invalid source, it should throw an error with proper message', () => {
      expect(() => core.validateRequest()).toThrow('Validate error: source is not a string')
      expect(() => core.validateRequest(null)).toThrow('Validate error: source is not a string')
      expect(() => core.validateRequest(undefined)).toThrow('Validate error: source is not a string')
      expect(() => core.validateRequest(true)).toThrow('Validate error: source is not a string')
      expect(() => core.validateRequest({})).toThrow('Validate error: source is not a string')
      expect(() => core.validateRequest([])).toThrow('Validate error: source is not a string')
    })

    it('given a not allowed source, it should throw an error with proper message', () => {
      expect(() => core.validateRequest('', Joi.string().required())).toThrow('Validate error: bad validation source, possible options are "body", "params", "query"')
    })

    it('given a request with empty payloads, it should throw an http error with proper information', () => {
      const handler = core.validateRequest('body', Joi.string().required())
      try {
        handler({}, null, null)
      } catch (err) {
        expect(err.isHttp).toBeTruthy()
        expect(err.message).toEqual('Request body data is missing')
        expect(err.output).toEqual({
          message: 'Request body data is missing',
          status: 422,
          type: 'VALIDATION',
        })
      }
    })

    it('given a request with bad payload, it should throw an http error with proper information', () => {
      const schema = Joi.object({
        foo: Joi.boolean().required(),
        bar: Joi.string().required(),
      })

      const handler = core.validateRequest('params', schema)
      try {
        handler({ params: {} }, null, null)
      } catch (err) {
        expect(err.isHttp).toBeTruthy()
        expect(err.message).toEqual('Invalid request params data')
        expect(err.output).toEqual({
          message: 'Invalid request params data',
          status: 422,
          type: 'VALIDATION',
          attributes: {
            bar: {
              message: 'bar is required',
              type: 'any.required',
            },
            foo: {
              message: 'foo is required',
              type: 'any.required',
            },
          },
        })
      }
    })
  })

  describe('#notFoundHandler', () => {
    const next = jest.fn()

    afterEach(() => {
      next.mockClear()
    })

    it('should send a formatted 404 error object', () => {
      core.notFoundHandler(null, null, next)
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toEqual('Not Found')
      expect(error.isHttp).toBeTruthy()
      expect(error.output).toEqual({
        message: 'Not Found',
        status: 404,
        type: 'NOT_FOUND',
      })
    })
  })

  describe('#generalErrorHandler', () => {
    const status = jest.fn()
    const json = jest.fn()
    const logError = jest.fn()

    const res = { status, json }
    const req = { app: { logger: { error: logError } } }

    afterEach(() => {
      status.mockClear()
      logError.mockClear()
      logError.mockClear()
    })

    it('given an http error object, it should send the proper status code and error output', () => {
      const error = ndtk.httpError(404)
      core.generalErrorHandler(error, req, res)
      expect(logError).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(404)
      expect(json).toHaveBeenCalledWith(error.output)
    })

    it('given a non http error object, it should send the proper status code and error output', () => {
      const error = new Error('Ops!')
      core.generalErrorHandler(error, req, res)
      expect(logError).toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        status: 500,
        type: 'INTERNAL_SERVER_ERROR',
      })
    })

    it('given an error object without message, it should send the proper status code and error output', () => {
      const error = new Error()
      core.generalErrorHandler(error, req, res)
      expect(logError).toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        status: 500,
        type: 'INTERNAL_SERVER_ERROR',
      })
    })
  })
})

describe('Expressio / Core Demo', () => {
  beforeAll(async () => {
    await app.start()
  })

  afterAll(() => {
    app.stop()
  })

  it('(GET /sync) should get a proper error from a sync route', async () => {
    const response = await request(app).get('/sync')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Ops from sync route',
      status: 400,
      type: 'BAD_REQUEST',
    })
  })

  it('(GET /async) should get a proper error from an async route', async () => {
    const response = await request(app).get('/async')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Ops from async route',
      status: 400,
      type: 'BAD_REQUEST',
    })
  })
})
