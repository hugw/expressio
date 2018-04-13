/**
 * Server test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import express from 'express'
import server from '../server'
import logger from '../logger'

const app = express()
const config = {
  port: 5001,
  address: '0.0.0.0',
  env: 'currentEnv'
}
const serverInstance = server(app, config)

describe('Expressio / Server', () => {
  const loggerSpy = jest.spyOn(logger, 'info').mockImplementation(() => true)

  beforeEach(() => {
    loggerSpy.mockClear()
  })

  afterAll(() => {
    loggerSpy.mockRestore()
  })

  it('should expose an api', () => {
    expect(Object.keys(serverInstance)).toEqual(['instance', 'start', 'stop'])
  })

  describe('#instance', () => {
    afterAll(() => {
      serverInstance.stop()
    })

    it('should be a null it no server has started', () => {
      expect(serverInstance.instance).toBeNull()
    })

    it('should have an http server instance when it has started', async () => {
      await serverInstance.start()
      expect(serverInstance.instance.address()).toEqual({ address: '0.0.0.0', family: 'IPv4', port: 5001 })
    })
  })

  describe('#stop', () => {
    it('should close the server instance properly and nullify', async () => {
      await serverInstance.start()
      expect(serverInstance.instance).toBeTruthy()

      serverInstance.stop()
      expect(serverInstance.instance).toBeNull()
    })
  })

  describe('#start', () => {
    afterEach(() => {
      serverInstance.stop()
    })

    it('should start the server instance properly', async () => {
      const res = await serverInstance.start()

      expect(res).toEqual('Server started')
      expect(logger.info).toHaveBeenCalledWith('Server running → 0.0.0.0:5001 @ currentEnv')
    })

    it('should not break if called twice', async () => {
      const res = await serverInstance.start()
      const otherRes = await serverInstance.start()

      expect(res).toEqual('Server started')
      expect(otherRes).toEqual('Server already running')
      expect(logger.info).toHaveBeenCalledTimes(1)
    })
  })
})
