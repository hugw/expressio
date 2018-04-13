/**
 * Mongo API test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import mongo, { mongoose } from '../mongo'
import * as utils from '../utils'
import logger from '../logger'

const config = {
  mongo: {
    connection: 'mongodb://localhost:27017/testApi',
    seed: './seed'
  },
  root: __dirname,
  env: 'currentEnv'
}

const database = mongo(config)

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  hiddenField: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  filter: ['hiddenField']
})

const User = mongoose.model('User', userSchema)

describe('Expressio / Mongo API', () => {
  const terminateSpy = jest.spyOn(utils, 'terminate').mockImplementation(() => true)
  const loggerSpy = jest.spyOn(logger, 'info').mockImplementation(() => true)

  beforeEach(async () => {
    await database.reset({ disconnect: true })
    terminateSpy.mockClear()
    loggerSpy.mockClear()
  })

  afterAll(() => {
    terminateSpy.mockRestore()
    loggerSpy.mockRestore()
  })

  it('should expose mongoose object', () => {
    expect(mongoose).toBeDefined()
  })

  it('should expose an api', () => {
    expect(Object.keys(database)).toEqual([
      'seedOnly',
      'seed',
      'resetOnly',
      'reset',
      'connect',
      'disconnect'
    ])
  })

  it('should terminate when no valid connection is provided', () => {
    mongo({ mongo: { connection: null } })
    expect(terminateSpy).toBeCalledWith('Database connection does not exist.')
  })

  describe('#connect', () => {
    it('should start the server successfully', async () => {
      await database.connect()
      expect(logger.info).toBeCalledWith('Database running → MongoDB @ currentEnv.')
      expect(mongoose.connection.readyState).toEqual(1)
    })

    it('should return null when connection is already stabilished', async () => {
      await database.connect()
      const res = await database.connect()
      expect(mongoose.connection.readyState).toEqual(1)
      expect(res).toEqual('Mongo already connected')
    })

    it('should fail when something is wrong with the database', async () => {
      const badConfig = {
        mongo: {
          connection: 'mongodb://localhost:27018/',
        },
      }

      const badDatabase = mongo(badConfig)
      await badDatabase.connect()
      expect(terminateSpy).toBeCalledWith('Something went wrong while starting the database.')
    })
  })

  describe('#disconnect', () => {
    it('should disconnect the database successfully', async () => {
      await database.connect()
      expect(mongoose.connection.readyState).toEqual(1)

      database.disconnect()
      expect(mongoose.connection.readyState).toEqual(3)
    })
  })

  describe('#resetOnly', () => {
    it('should reset database successfully', async () => {
      await database.connect()
      loggerSpy.mockClear()

      await User.create({ name: 'Foo', hiddenField: 'Bar' })
      await User.create({ name: 'Bar', hiddenField: 'Foo' })

      expect(await User.find().count()).toEqual(2)

      await database.resetOnly()

      expect(await User.find().count()).toEqual(0)
      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith('Database reset successfully.')
      expect(logger.info).toHaveBeenCalledWith('Resetting database...')
    })
  })

  describe('#reset', () => {
    it('should connect and reset database successfully', async () => {
      await database.connect()

      await User.create({ name: 'Foo', hiddenField: 'Bar' })
      await User.create({ name: 'Bar', hiddenField: 'Foo' })

      expect(await User.find().count()).toEqual(2)

      database.disconnect()
      await database.reset()

      expect(await User.find().count()).toEqual(0)
      expect(mongoose.connection.readyState).toEqual(1)
    })

    it('should connect, reset database, and disconnect successfully', async () => {
      await database.connect()

      await User.create({ name: 'Foo', hiddenField: 'Bar' })
      await User.create({ name: 'Bar', hiddenField: 'Foo' })

      expect(await User.find().count()).toEqual(2)

      database.disconnect()
      await database.reset({ disconnect: true })
      expect(mongoose.connection.readyState).toEqual(3)

      await database.connect()
      expect(await User.find().count()).toEqual(0)
    })
  })

  describe('#seedOnly', () => {
    it('should seed database successfully', async () => {
      await database.connect()
      loggerSpy.mockClear()

      await database.seedOnly()

      expect(await User.find().count()).toEqual(1)
      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith('Adding seed data...')
      expect(logger.info).toHaveBeenCalledWith('Seed data added successfuly.')
    })

    it('should fail when no valid seed is provided', async () => {
      const badConfig = {
        ...config,
        mongo: {
          connection: 'mongodb://localhost:27017/testApi',
          seed: null
        },
      }

      const badDatabase = mongo(badConfig)
      await badDatabase.connect()
      loggerSpy.mockClear()

      await badDatabase.seedOnly()

      expect(logger.info).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith('No seed data found.')
    })
  })

  describe('#seed', () => {
    it('should connect and seed database successfully', async () => {
      await database.seed()

      expect(await User.find().count()).toEqual(1)
      expect(mongoose.connection.readyState).toEqual(1)
    })

    it('should connect, seed database, and disconnect successfully', async () => {
      await database.seed({ disconnect: true })
      expect(mongoose.connection.readyState).toEqual(3)

      await database.connect()
      expect(await User.find().count()).toEqual(1)
    })
  })

  describe('Hidden fields', () => {
    it('should not be available when fetching data', async () => {
      await database.seed()
      const user = await User.findOne()
      const props = Object.keys(user.toObject())

      expect(props).not.toContain('hiddenField')
      expect(props).not.toContain('_id')
      expect(props).not.toContain('__v')
    })
  })

  describe('Timestamps', () => {
    it('should be available when fetching/creating new documents', async () => {
      await database.seed()
      const user = await User.findOne()
      const props = Object.keys(user.toObject())

      expect(props).toContain('createdAt')
      expect(props).toContain('updatedAt')
    })
  })
})
