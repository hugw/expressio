/**
 * Utils test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import { isNodeSupported, isDir, getConfig, reqError } from '../utils'

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

  describe('#reqError', () => {
    it('should generate a request error object with no custom data', () => {
      const err = reqError(400)
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
    })

    it('should generate a request error object with custom data', () => {
      const err = reqError(400, { foo: 'foo' })
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toEqual('Bad Request')
      expect(err.status).toEqual(400)
      expect(err.data).toEqual({ foo: 'foo' })
    })
  })

  it.skip('#getModels', () => {})

  describe('#getConfig', () => {
    const configPath = path.join(__dirname, 'config')

    it('should return a config object', () => {
      expect(getConfig(configPath)).toEqual({
        address: '127.0.0.1',
        authorization: {
          enabled: true,
          ignorePaths: []
        },
        cors: {
          origin: '*',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          preflightContinue: false,
          optionsSuccessStatus: 204
        },
        db: {
          enabled: false,
          connection: 'mongodb://localhost:27017/test'
        },
        env: 'test',
        port: '4000',
        reqNode: { minor: 6, major: 8 },
        secret: 'Default secret key',
        local: 'test',
        default: 'default'
      })
    })

    it('should return a config object with overwritten values from a second param passed', () => {
      const config = { secret: 'my secret', db: { enabled: true } }
      const configs = getConfig(configPath, config)
      expect(configs.secret).toBe('my secret')
      expect(configs.db.enabled).toBe(true)
    })
  })
})
