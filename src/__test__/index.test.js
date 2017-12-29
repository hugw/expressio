/**
 * Expressio test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio, { express, dataTypes, jwt, statusCode, validate, controller } from '../'
import * as utils from '../utils'

describe('Expressio', () => {
  const spyTerminate = jest.spyOn(utils, 'terminate')
    .mockImplementation(() => true)

  afterEach(() => {
    spyTerminate.mockClear()
  })

  afterAll(() => {
    spyTerminate.mockRestore()
  })

  it('should expose an external dependencies object', () => {
    expect(express).toBeDefined()
    expect(dataTypes).toBeDefined()
    expect(jwt).toBeDefined()
    expect(statusCode).toBeDefined()
  })

  it('should expose middlewares', () => {
    expect(validate).toBeDefined()
    expect(controller).toBeDefined()
  })

  it('should return a valid expressio object', () => {
    const server = expressio(__dirname)

    expect(spyTerminate).not.toHaveBeenCalled()
    expect(server.startServer).toBeDefined()
    expect(server.stopServer).toBeDefined()
    expect(server.stopDB).toBeDefined()
    expect(server.startDB).toBeDefined()
    expect(server.resetDB).toBeDefined()
    expect(server.seedDB).toBeDefined()
  })

  it('should load environment variables', () => {
    expressio(__dirname)

    expect(process.env.FOO).toBe('BAR')
  })

  it('should stop the process when node minimum version is not met', () => {
    expressio(__dirname, {
      reqNode: { minor: 20, major: 20 }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('Current Node version is not supported.')
  })

  it('should stop the server when no valid "rootPath" folder is provided', () => {
    expressio()

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('"rootPath" is not valid.')
  })

  it('should stop the server when no database settings is provided', () => {
    expressio(__dirname, {
      db: {
        enabled: true,
        connection: null
      }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('Database connection for "test" env does not exist.')
  })
})
