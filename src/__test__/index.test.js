/**
 * Expressio test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import expressio from '../'
import * as utils from '../utils'

describe('Expressio', () => {
  const spyTerminate = jest.spyOn(utils, 'terminate')
    .mockImplementation(() => true)

  afterAll(() => {
    spyTerminate.mockRestore()
  })

  it('should return a valid expressio instance', () => {
    const server = expressio({ publicDir: path.join(__dirname, 'public') })
    expect(spyTerminate).not.toHaveBeenCalled()
    expect(server.startServer).toBeDefined()
  })

  it('should stop the server when no public dir is provided', () => {
    expressio()
    expect(spyTerminate).toHaveBeenCalled()
  })

  it('should stop the server node minimum version is not met', () => {
    expressio({
      publicDir: path.join(__dirname, 'public'),
      reqNode: { minor: 3, major: 3 }
    })

    expect(spyTerminate).toHaveBeenCalled()
  })
})
