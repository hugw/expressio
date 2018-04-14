/**
 * Demo test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import request from 'supertest'

import app from '../app'

const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM4OTk0MDUsImV4cCI6MTkyNDEyNjYwNSwiYXVkIjoiRXhwcmVzc2lvIiwic3ViIjoiIiwiTmFtZSI6IkpvaG4gRG9lIiwiSWQiOiIxIn0.WZu0BVJcmK73jwZEFkbT0E6M_np_4dt3IXiqBt3YRF4'

const invalidToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM4OTk0MDUsImV4cCI6MTkyNDEyNjYwNSwiYXVkIjoiRXhwcmVzc2lvIiwic3ViIjoiIiwiTmFtZSI6IkpvaG4gRG9lIiwiSWQiOiIxIn0.qC9sUsSzrfBZbcHOEemRmbi2t5k4mkVFq3h7Ox0TPmQ'

describe('Demo routes', () => {
  beforeAll(async () => {
    await app.start()
    await app.database.reset()
  })

  afterAll(() => {
    app.stop()
  })

  it('(GET /) should respond with a success payload', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Home', app: 'Demo Server' })
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

  it('(POST /user) with valid params should return an user payload', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.statusCode).toBe(200)
    expect(response.body.page).toEqual('User')
    expect(response.body.user.name).toBe('John Doe')
    expect(response.body.user.email).toBe('john@doe.com')
    expect(response.body.user.createdAt).toBeDefined()
  })

  it('(POST /user) with duplicate email should return an error message', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.statusCode).toBe(422)
    expect(response.body.message).toEqual('Invalid data')
    expect(response.body.body).toEqual({
      email: {
        message: 'Email is already in use',
        validator: 'unique'
      },
    })
  })

  it('(POST /user) with invalid email should return an error message', async () => {
    const payload = { name: 'John Doe', email: 'foo' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.statusCode).toBe(422)
    expect(response.body.message).toEqual('Invalid body data')
    expect(response.body.body).toEqual({
      email: {
        message: 'Email is not a valid email',
        validator: 'email'
      },
    })
  })

  it('(GET /forbidden) show catch thrown errors and return a forbidden error', async () => {
    const response = await request(app).get('/forbidden')
    expect(response.statusCode).toBe(403)
    expect(response.body.message).toEqual('Oops!')
  })
})
