import request from 'supertest'

import jwt from '@/jwt'
import app from './fixtures/jwt/app'

describe('Expressio / JWT initializer', () => {
  const use = jest.fn()
  const on = jest.fn()

  const config = {
    enabled: true,
    expiresIn: '7d',
    algorithm: 'HS256',
    secret: 'secret',
  }

  afterEach(() => {
    use.mockClear()
    on.mockClear()
  })

  it('should load the initializer and expose an api to the server', () => {
    const server = { use, events: { on } }
    jwt(server, config)

    expect(Object.keys(server.jwt)).toEqual(['sign', 'setup'])
    expect(use).toHaveBeenCalledTimes(1)
    expect(on).toHaveBeenCalledTimes(1)
  })

  it('should not load the initializer and expose an api to the server if enabled is set to "false"', () => {
    const server = { use, events: { on } }
    jwt(server, { ...config, enabled: false })

    expect(server.jwt).toBeFalsy()
    expect(use).toHaveBeenCalledTimes(0)
    expect(on).toHaveBeenCalledTimes(0)
  })

  it('given no "enabled" config, it should throw an error with proper message', () => {
    const fn = () => jwt({}, { ...config, enabled: undefined })
    expect(fn).toThrow('Invalid JWT config: "enabled" is required')
  })

  it('given no "expiresIn" config, it should throw an error with proper message', () => {
    const fn = () => jwt({}, { ...config, expiresIn: undefined })
    expect(fn).toThrow('Invalid JWT config: "expiresIn" is required')
  })

  it('given no "algorithm" config, it should throw an error with proper message', () => {
    const fn = () => jwt({}, { ...config, algorithm: undefined })
    expect(fn).toThrow('Invalid JWT config: "algorithm" is required')
  })

  it('given no "secret" config, it should throw an error with proper message', () => {
    const fn = () => jwt({}, { ...config, secret: undefined })
    expect(fn).toThrow('Invalid JWT config: "secret" is required')
  })
})

describe('Expressio / JWT Demo', () => {
  const token = {
    expired: app.jwt.sign({}, { expiresIn: '1ms' }),
    valid: app.jwt.sign({ id: 1 }),
    invalid: 'invalid',
    badSignature: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0NjcyMjkwMDgsImV4cCI6MTU2MTgyOTgwOCwiYXVkIjoiIiwic3ViIjoiIn0.1HwOMpiEX1NxOjL8NbNBJFa2YMVsqp79YlatZvnKWOw',
  }

  beforeAll(async () => {
    await app.start()
  })

  afterAll(() => {
    app.stop()
  })

  it('(GET /public) without token, it should return success with token payload', async () => {
    const response = await request(app).get('/public')
    expect(response.status).toBe(204)
  })

  it('(GET /private) with valid token, it should return success with token payload', async () => {
    const response = await request(app).get('/private').set('Authorization', `Bearer ${token.valid}`)

    expect(response.status).toBe(200)
    expect(Object.keys(response.body)).toEqual(['data', 'iat', 'exp'])
    expect(response.body.data).toEqual({ id: 1 })
  })

  it('(GET /private) without headers, it should return an error with proper message', async () => {
    const response = await request(app).get('/private')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'Authorization token is missing',
      status: 401,
      type: 'UNAUTHORIZED',
    })
  })

  it('(GET /private) with invalid headers, it should return an error with proper message', async () => {
    const response = await request(app).get('/private').set('Authorization', token.valid)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'Format is Authorization: Bearer [token]',
      status: 401,
      type: 'UNAUTHORIZED',
    })
  })

  it('(GET /private) with invalid token, it should return an error with proper message', async () => {
    const response = await request(app).get('/private').set('Authorization', `Bearer ${token.invalid}`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'The token provided is invalid',
      status: 401,
      type: 'UNAUTHORIZED',
    })
  })

  it('(GET /private) with bad signature token, it should return an error with proper message', async () => {
    const response = await request(app).get('/private').set('Authorization', `Bearer ${token.badSignature}`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'The token provided is invalid',
      status: 401,
      type: 'UNAUTHORIZED',
    })
  })

  it('(GET /private) with expired token, it should return an error with proper message', async () => {
    const response = await request(app).get('/private').set('Authorization', `Bearer ${token.expired}`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'The token provided has expired',
      status: 401,
      type: 'UNAUTHORIZED',
    })
  })
})
