/**
 * Expressio test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import expressio, { express, joi, validate } from '../'
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

  it('should expose an Express object', () => {
    expect(express).toBeDefined()
  })

  it('should expose a joi object', () => {
    expect(joi).toBeDefined()
  })

  it('should expose a validate middleware', () => {
    expect(validate).toBeDefined()
  })

  it('should return a valid expressio object', () => {
    const server = expressio({
      rootPath: __dirname,
    })

    expect(spyTerminate).not.toHaveBeenCalled()
    expect(server.startServer).toBeDefined()
    expect(server.stopServer).toBeDefined()
    expect(server.stopDB).toBeDefined()
    expect(server.startDB).toBeDefined()
    expect(server.resetDB).toBeDefined()
    expect(server.seedDB).toBeDefined()
  })

  it('should load environment variables', () => {
    expressio({
      rootPath: __dirname,
    })

    expect(process.env.FOO).toBe('BAR')
  })

  it('should stop the process when node minimum version is not met', () => {
    expressio({
      rootPath: __dirname,
      reqNode: { minor: 20, major: 20 }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('Current Node version is not supported.')
  })

  it('should stop the server when no valid "rootPath" folder is provided', () => {
    expressio({
      rootPath: null,
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('"rootPath" is not valid.')
  })

  it('should stop the server when no "public" folder is provided', () => {
    expressio({
      rootPath: path.resolve(__dirname, './fixtures/no-public-folder'),
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('"public" folder does not exist.')
  })

  it('should stop the server when no "models" folder is provided', () => {
    expressio({
      rootPath: path.resolve(__dirname, './fixtures/no-models-folder'),
      db: { enabled: true }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('"models" folder does not exist.')
  })

  it('should stop the server when no "config" folder is provided', () => {
    expressio({
      rootPath: path.resolve(__dirname, './fixtures/no-config-folder'),
      db: { enabled: true }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('"config" folder does not exist.')
  })

  it('should stop the server when no database settings is provided', () => {
    expressio({
      rootPath: __dirname,
      db: {
        enabled: true,
        connection: null
      }
    })

    expect(spyTerminate).toHaveBeenCalled()
    expect(spyTerminate).toBeCalledWith('Database connection for "test" env does not exist.')
  })
})
