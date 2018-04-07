/**
 * Mongo API test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import mongo, { mongoose } from '../mongo'
import * as utils from '../utils'

const spyTerminate = jest.spyOn(utils, 'terminate').mockImplementation(() => true)

describe('Expressio / Mongo API', () => {
  afterEach(() => {
    spyTerminate.mockClear()
  })

  afterAll(() => {
    spyTerminate.mockRestore()
  })

  it('should expose mongoose object', () => {
    expect(mongoose).toBeDefined()
  })

  describe('API', () => {
    it('should stop the server when no database settings is provided', () => {
      mongo({ connection: null })

      expect(spyTerminate).toHaveBeenCalled()
      expect(spyTerminate).toBeCalledWith('Database connection does not exist.')
    })
  })
})
