/**
 * Utils test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { isNodeSupported, isDir, getConfig, terminate, httpError } from '../utils'
import logger from '../logger'

describe('Expressio / Utils', () => {
  describe('#isNodeSupported', () => {
    let major
    let minor

    beforeAll(() => {
      [major, minor] = process.versions.node.split('.').map(parseFloat)
    })

    it('should return TRUE when Node version > minimum required', () => {
      const required = {
        minor: minor - 1,
        major: major - 1
      }

      expect(isNodeSupported(required)).toBeTruthy()
    })

    it('should return TRUE when Node version >= minimum required', () => {
      const required = { minor, major }

      expect(isNodeSupported(required)).toBeTruthy()
    })

    it('should return FALSE when Node version < minimum required', () => {
      const required = {
        minor: minor + 1,
        major: major + 1
      }

      expect(isNodeSupported(required)).toBeFalsy()
    })
  })

  describe('#isDir', () => {
    it('should return TRUE for a valid directory', () => {
      expect(isDir('../')).toBeTruthy()
    })

    it('should return FALSE for an invalid public directory', () => {
      expect(isDir('')).toBeFalsy()
      expect(isDir()).toBeFalsy()
      expect(isDir(null)).toBeFalsy()
      expect(isDir(false)).toBeFalsy()
      expect(isDir(undefined)).toBeFalsy()
    })
  })

  describe('#terminate', () => {
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => true)
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => true)

    beforeEach(() => {
      processSpy.mockClear()
      loggerSpy.mockClear()
    })

    afterAll(() => {
      processSpy.mockRestore()
      loggerSpy.mockRestore()
    })

    it('should log the error message and exit the process', () => {
      terminate('an error message')
      expect(processSpy).toHaveBeenCalledWith(1)
      expect(loggerSpy).toHaveBeenCalledWith('an error message')
    })
  })

  describe('#getConfig', () => {
    const config = {
      base: {
        secret: 'Another secret',
        foo: 'bar',
      },
      test: {
        mongo: {
          connection: null,
          seed: 'pathToSeed'
        },
        mailer: null,
        cors: null,
      }
    }

    it('should return a formatted config object', () => {
      expect(getConfig(config)).toEqual({
        address: '127.0.0.1',
        logLevel: 'info',
        port: '4000',
        env: 'test',
        public: 'public',
        foo: 'bar',
        cors: null,
        secret: 'Another secret',
        mongo: {
          connection: null,
          seed: 'pathToSeed'
        },
        sequelize: {
          folder: {
            models: 'models',
            db: 'db',
          },
          seed: null,
          connection: {
            database: null,
            username: null,
            password: null,
            host: null,
            dialect: 'sqlite',
            storage: 'development.sqlite'
          },
          config: {}
        },
        reqNode: { minor: 6, major: 8 },
        mailer: null
      })
    })
  })

  describe('#httpError', () => {
    it('given valid argments, it show return a formatted error object', () => {
      const error = httpError(422, {
        message: 'Something is wrong',
        type: 'validation',
        errors: {
          email: 'Invalid'
        }
      })

      expect(error).toBeInstanceOf(Error)
      expect(error.isHttp).toBeTruthy()
      expect(error.message).toEqual('Something is wrong')
      expect(error.output).toEqual({
        message: 'Something is wrong',
        type: 'validation',
        errors: {
          email: 'Invalid'
        },
        status: 422
      })
    })

    it('given empty arguments, it should return a default formatted error object', () => {
      const error = httpError()

      expect(error.message).toEqual('Internal Server Error')
      expect(error.output).toEqual({
        message: 'Internal Server Error',
        type: 'internalServerError',
        status: 500
      })
    })

    it('given only status code, it should return an error object with default messages', () => {
      const error = httpError(400)

      expect(error.message).toEqual('Bad Request')
      expect(error.output).toEqual({
        message: 'Bad Request',
        type: 'badRequest',
        status: 400
      })
    })
  })
})
