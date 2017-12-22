/**
 * Utils test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { isNodeSupported, isDir } from '../utils'

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
})
