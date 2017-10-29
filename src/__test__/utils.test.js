/**
 * Utils test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { isNodeSupported } from '../utils'

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

  // describe('#hasPublicDir', () => {
  //   it('should return TRUE for a valid public directory', () => {
  //     expect(hasPublicDir('../')).toBeTruthy()
  //   })

  //   it('should return FALSE for an invalid public directory', () => {
  //     expect(hasPublicDir('')).toBeFalsy()
  //     expect(hasPublicDir()).toBeFalsy()
  //     expect(hasPublicDir(null)).toBeFalsy()
  //     expect(hasPublicDir(false)).toBeFalsy()
  //     expect(hasPublicDir(undefined)).toBeFalsy()
  //   })
  // })
})
