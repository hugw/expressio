/**
 * Expressio test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import expressio, {
  jwt,
  validatejs,
  router,
  mongoose,
  httpError,
  logger,
  authorize,
  controller
} from '../'
import * as utils from '../utils'

describe('Expressio', () => {
  const terminateSpy = jest.spyOn(utils, 'terminate')
    .mockImplementation(() => true)

  afterEach(() => {
    terminateSpy.mockClear()
  })

  afterAll(() => {
    terminateSpy.mockRestore()
  })

  it('should expose external dependencies & utility functions', () => {
    expect(validatejs).toBeDefined()
    expect(jwt).toBeDefined()
    expect(router).toBeDefined()
    expect(httpError).toBeDefined()
    expect(logger).toBeDefined()
    expect(mongoose).toBeDefined()
    expect(authorize).toBeDefined()
    expect(controller).toBeDefined()
  })

  it('given a valid configuration, it should return an expressio object', () => {
    const { app, config, mailer } = expressio({
      base: {
        root: __dirname,
        public: null
      }
    })

    expect(app.server).toBeDefined()
    expect(mailer).toBeDefined()
    expect(app.stop).toBeDefined()
    expect(app.start).toBeDefined()
    expect(app.mongo).toBeDefined()
    expect(config).toBeDefined()
  })

  it('given no configuration, it should terminate with proper error', () => {
    expressio()
    expect(terminateSpy).toHaveBeenLastCalledWith('No valid configuration object was provided.')
  })

  it('given a malformed configuration, it should terminate with proper error', () => {
    expressio({})
    expect(terminateSpy).toHaveBeenLastCalledWith('No valid configuration object was provided.')
  })

  it('given an invalid root configuration, it should terminate with proper error', () => {
    expressio({ base: { root: null } })
    expect(terminateSpy).toHaveBeenLastCalledWith('"root" configuration is not a valid path.')
  })

  it('given invalid node req configuration, it should terminate with proper error', () => {
    expressio({
      base: {
        root: __dirname,
        public: null,
        reqNode: { minor: 20, major: 20 },
      }
    })

    expect(terminateSpy).toBeCalledWith('Current Node version is not supported.')
  })

  it('should load environment variables', () => {
    expressio({
      base: {
        root: path.join(__dirname, 'fixtures'),
        public: null
      }
    })

    expect(process.env.FOO).toBe('BAR')
  })
})
