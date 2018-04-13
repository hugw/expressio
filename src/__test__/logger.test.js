/**
 * Logger test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import logger, { loggerMiddleware } from '../logger'

describe('Expressio / Logger', () => {
  describe('#logger', () => {
    it('should expose a logging api', () => {
      expect(logger.info).toBeDefined()
      expect(logger.error).toBeDefined()
      expect(logger.warn).toBeDefined()
      expect(logger.debug).toBeDefined()
    })

    it('should have its default level set to "info"', () => {
      expect(logger.level).toEqual('info')
    })
  })

  describe('#loggerMiddleware', () => {
    it('should exist', () => {
      expect(loggerMiddleware).toBeDefined()
      expect(loggerMiddleware).toBeInstanceOf(Function)
    })
  })
})
