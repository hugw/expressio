/**
 * Demo test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import request from 'supertest'

import app from '../'

const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM4OTk0MDUsImV4cCI6MTkyNDEyNjYwNSwiYXVkIjoiRXhwcmVzc2lvIiwic3ViIjoiIiwiTmFtZSI6IkpvaG4gRG9lIiwiSWQiOiIxIn0.WZu0BVJcmK73jwZEFkbT0E6M_np_4dt3IXiqBt3YRF4'

const invalidToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM4OTk0MDUsImV4cCI6MTkyNDEyNjYwNSwiYXVkIjoiRXhwcmVzc2lvIiwic3ViIjoiIiwiTmFtZSI6IkpvaG4gRG9lIiwiSWQiOiIxIn0.qC9sUsSzrfBZbcHOEemRmbi2t5k4mkVFq3h7Ox0TPmQ'

describe('Demo routes', () => {
  beforeAll(async () => {
    await app.resetDB()
  })

  afterAll(() => {
    app.stopServer()
  })

  it('(GET /) should respond with a success payload', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Home', appName: 'Demo' })
  })

  it('(GET /public) should respond with a success payload', async () => {
    const response = await request(app).get('/public')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Public' })
  })

  it('(GET /unauthorized) should respond with an error "No authorization token was found"', async () => {
    const response = await request(app).get('/unauthorized')
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('No authorization token was found')
    expect(response.body.statusCode).toEqual(401)
  })

  it('(GET /unauthorized) with an invalid token should respond with an error "Format is Authorization: Bearer [token]"', async () => {
    const response = await request(app).get('/unauthorized')
      .set('Authorization', 'Bearer')
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('Format is Authorization: Bearer [token]')
    expect(response.body.statusCode).toEqual(401)
  })

  it('(GET /unauthorized) with an invalid token should respond with an error "jwt malformed"', async () => {
    const response = await request(app).get('/unauthorized')
      .set('Authorization', 'Bearer 123')
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('jwt malformed')
    expect(response.body.statusCode).toEqual(401)
  })

  it('(GET /unauthorized) with an invalid token should respond with an error "invalid token"', async () => {
    const response = await request(app).get('/unauthorized')
      .set('Authorization', 'Bearer 123.123.123')
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('invalid token')
    expect(response.body.statusCode).toEqual(401)
  })

  it('(GET /unauthorized) with an invalid token should respond with an error "invalid signature"', async () => {
    const response = await request(app).get('/unauthorized')
      .set('Authorization', `Bearer ${invalidToken}`)
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('invalid signature')
    expect(response.body.statusCode).toEqual(401)
  })

  it('(GET /authorized) with a valid token should respond with the token payload', async () => {
    const response = await request(app).get('/authorized')
      .set('Authorization', `Bearer ${validToken}`)
    expect(response.statusCode).toBe(200)
    expect(response.body.page).toEqual('Authorized')
    expect(response.body.user.aud).toEqual('Expressio')
  })

  it('(GET /notfound) should respond with a 404 payload', async () => {
    const response = await request(app).get('/notfound')
    expect(response.statusCode).toBe(404)
    expect(response.body.message).toEqual('Not Found')
    expect(response.body.statusCode).toEqual(404)
  })

  it('(POST /article) with valid params should return an article payload', async () => {
    const payload = { title: 'Article title', description: 'Lorem ipsum...' }
    const response = await request(app).post('/article')
      .send(payload)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Article', ...payload })
  })

  it('(POST /article) with extra params should filter from body', async () => {
    const payload = { title: 'Article title', description: 'Lorem ipsum...', extra: 'notallowed' }
    const response = await request(app).post('/article')
      .send(payload)
    expect(response.statusCode).toBe(200)
    expect(response.body.extra).toBeUndefined()
  })

  it('(POST /article) with invalid params should return a 400 error', async () => {
    const payload = { title: 'Ar', description: '', extra: 'notallowed' }
    const response = await request(app).post('/article')
      .send(payload)
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toEqual('Bad Request')
    expect(response.body.errors).toEqual({
      description: {
        message: 'Description can\'t be blank',
        validator: 'presence'
      },
      title: {
        message: 'Title is too short (minimum is 3 characters)',
        validator: 'length'
      }
    })
  })

  it('(GET /config) should respond with a config object', async () => {
    const response = await request(app).get('/config')
    expect(response.statusCode).toBe(200)
    expect(response.body.config).toEqual(['config', 'models'])
  })

  it('(POST /user) with valid params should return an user payload', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com', hidden: 'boo' }
    const response = await request(app).post('/user')
      .send(payload)
    expect(response.statusCode).toBe(200)
    expect(response.body.page).toEqual('User')
    expect(response.body.user.name).toBe('John Doe')
    expect(response.body.user.email).toBe('john@doe.com')
    expect(response.body.user.hidden).toBeUndefined()
  })

  it('(GET /custom-error) should respond with a custom 400 payload', async () => {
    const response = await request(app).get('/custom-error')
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toEqual('Bad Request')
    expect(response.body.errors).toEqual({
      key: 'something wrong with this key'
    })
  })

  it('(POST /controller) show catch thrown errors and return a 500 error', async () => {
    const response = await request(app).post('/controller')
    expect(response.statusCode).toBe(500)
    expect(response.body.message).toEqual('Internal Server Error')
  })

  it('(GET /controller) should respond with a 200 payload', async () => {
    const response = await request(app).get('/controller')
    expect(response.statusCode).toBe(200)
    expect(response.body.page).toEqual('Controller')
    expect(response.body.promise).toEqual('wait a bit')
  })
})
