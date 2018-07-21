import request from 'supertest'

import database from '@/database'
import app from './fixtures/database/app'

describe('Expressio / Database Initializer', () => {
  const use = jest.fn()
  const on = jest.fn()

  const config = {
    enabled: true,
    dialect: 'sqlite',
    connection: 'development.sqlite',
    ssl: false,
  }

  const extras = {
    env: 'test',
    root: `${__dirname}/fixtures/database`,
    logger: {
      info: () => null,
    },
  }

  afterEach(() => {
    use.mockClear()
    on.mockClear()
  })

  it('should load the initializer and expose an api to the server', () => {
    const server = { use, events: { on }, ...extras }
    database(server, config)

    expect(Object.keys(server.database)).toEqual(['connect', 'disconnect', 'seed', 'truncate', 'run', 'reset', 'migrate', 'instance'])
    expect(Object.keys(server.models)).toEqual(['Task', 'User'])
    expect(Object.keys(server.database.migrate)).toEqual(['status', 'down', 'up', 'prev', 'next', 'summary', 'run'])
    expect(server.Sequelize).toBeDefined()
    expect(use).toHaveBeenCalledTimes(1)
    expect(on).toHaveBeenCalledTimes(3)
  })

  it('should not load the initializer and expose an api to the server if enabled is set to "false"', () => {
    const server = {}
    database(server, { ...config, enabled: false })

    expect(server.database).toBeFalsy()
    expect(server.models).toBeFalsy()
    expect(server.Sequelize).toBeFalsy()
    expect(use).toHaveBeenCalledTimes(0)
    expect(on).toHaveBeenCalledTimes(0)
  })

  it('given no "enabled" config, it should throw an error with proper message', () => {
    const fn = () => database({}, { ...config, enabled: undefined })
    expect(fn).toThrow('Invalid Database config: "enabled" is required')
  })

  it('given no "ssl" config, it should throw an error with proper message', () => {
    const fn = () => database({}, { ...config, ssl: undefined })
    expect(fn).toThrow('Invalid Database config: "ssl" is required')
  })

  it('given no "dialect" config, it should throw an error with proper message', () => {
    const fn = () => database({}, { ...config, dialect: undefined })
    expect(fn).toThrow('Invalid Database config: "dialect" is required')
  })

  it('given an invalid "dialect" config, it should throw an error with proper message', () => {
    const fn = () => database({}, { ...config, dialect: 'mysql' })
    expect(fn).toThrow('Invalid Database config: "dialect" must be one of [sqlite, postgres]')
  })

  it('given no "connection" config, it should throw an error with proper message', () => {
    const fn = () => database({}, { ...config, connection: undefined })
    expect(fn).toThrow('Invalid Database config: "connection" is required')
  })
})

describe('Expressio / Database Demo', () => {
  beforeAll(async () => {
    await app.database.seed()
    await app.start()
  })

  afterAll(() => {
    app.stop()
  })

  it('(POST /user) with valid params should return a user payload', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('John Doe')
    expect(response.body.email).toBe('john@doe.com')
    expect(response.body.createdAt).toBeDefined()
    expect(response.body.updatedAt).toBeDefined()
  })

  it('(POST /user) with duplicate email should return an error message', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.status).toBe(422)
    expect(response.body.status).toBe(422)
    expect(response.body.message).toEqual('Invalid data')
    expect(response.body.type).toEqual('VALIDATION')
    expect(response.body.attributes).toEqual({
      email: {
        message: 'email is already in use',
        type: 'unique',
      },
    })
  })

  it('(GET /user/:id) with valid params should return an user payload', async () => {
    const id = 2
    const response = await request(app).get(`/user/${id}`)

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('John Doe')
    expect(response.body.email).toBe('john@doe.com')
    expect(response.body.createdAt).toBeDefined()
    expect(response.body.updatedAt).toBeDefined()
  })

  it('(GET /user/:id) with not found id param should return an error message', async () => {
    const id = 30
    const response = await request(app).get(`/user/${id}`)

    expect(response.status).toBe(400)
    expect(response.body.status).toBe(400)
    expect(response.body.message).toEqual('User does not exist')
  })
})
