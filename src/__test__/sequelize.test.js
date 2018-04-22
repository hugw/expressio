/**
 * Sequelize API test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import sequelize from '../sequelize'
import * as utils from '../utils'
import logger from '../logger'

const config = {
  sequelize: {
    folder: {
      models: 'models',
      db: 'db',
    },
    seed: 'seed-sequelize',
    connection: {
      database: null,
      username: null,
      password: null,
      host: null,
      dialect: 'sqlite',
      storage: 'testApi.sqlite'
    },
    config: {}
  },
  root: path.join(__dirname, 'fixtures'),
  env: 'currentEnv'
}

const database = sequelize(config)

// const User = mongoose.model('User', userSchema)

describe('Expressio / Sequelize API', () => {
  const terminateSpy = jest.spyOn(utils, 'terminate').mockImplementation(() => true)
  const loggerSpy = jest.spyOn(logger, 'info').mockImplementation(() => true)

  beforeEach(async () => {
    await database.reset()
    terminateSpy.mockClear()
    loggerSpy.mockClear()
  })

  afterAll(() => {
    terminateSpy.mockRestore()
    loggerSpy.mockRestore()
  })

  it('should expose mongoose object', () => {
    expect(sequelize).toBeDefined()
  })

  it('should expose an api', () => {
    expect(Object.keys(database)).toEqual([
      'models',
      'migrations',
      'connect',
      'seed',
      'disconnect',
      'reset',
      'instance',
    ])
  })

  it('should expose a migrations api', () => {
    expect(Object.keys(database.migrations)).toEqual([
      'status',
      'down',
      'up',
      'prev',
      'next',
      'summary',
      'run',
    ])
  })

  it('should terminate when no valid connection is provided', () => {
    sequelize({ sequelize: { connection: null } })
    expect(terminateSpy).toBeCalledWith('Sequelize database connection does not exist.')
  })

  describe('#connect', () => {
    it('should start the server successfully', async () => {
      await database.connect()
      expect(logger.info).toBeCalledWith('Database running → sqlite @ currentEnv.')
    })

    it.skip('should fail when database has pending migrations')

    it('should fail when something is wrong with the database', async () => {
      const badConfig = {
        sequelize: {
          connection: {
            database: null,
            username: null,
            password: null,
            host: null,
            dialect: 'sqlite',
          },
        },
      }

      const badDatabase = sequelize(badConfig)
      await badDatabase.connect()
      expect(terminateSpy).toBeCalledWith('Something went wrong while starting Sequelize database.')
    })
  })

  it.skip('#reset')
  it.skip('#migrations')
  it.skip('#seed')
})
