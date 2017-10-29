/**
 * Expressio test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

// import path from 'path'
import expressio, { express } from '../'
import * as utils from '../utils'

describe('Expressio', () => {
  const spyTerminate = jest.spyOn(utils, 'terminate')
    .mockImplementation(() => true)

  afterAll(() => {
    spyTerminate.mockRestore()
  })

  it('should expose an Express instance', () => {
    expect(express).toBeDefined()
  })

  it('should return a valid expressio instance', () => {
    const server = expressio({
      rootPath: __dirname,
      mongo: false
    })

    expect(spyTerminate).not.toHaveBeenCalled()
    expect(server.startServer).toBeDefined()
  })

  // it('should stop the server when no public dir is provided', () => {
  //   expressio()
  //   expect(spyTerminate).toHaveBeenCalled()
  // })

  it('should stop the server when node minimum version is not met', () => {
    expressio({
      rootPath: __dirname,
      mongo: false,
      reqNode: { minor: 20, major: 20 }
    })

    expect(spyTerminate).toHaveBeenCalled()
  })
})
