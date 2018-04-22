/**
 * Demo test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import request from 'supertest'

import app from '../app'

describe('Demo sequelize routes', () => {
  beforeAll(async () => {
    await app.sequelize.seed()
    await app.start()
  })

  afterAll(() => {
    app.stop()
  })

  it('(POST /user) with valid params should return an user payload', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body.page).toEqual('User')
    expect(response.body.user.name).toBe('John Doe')
    expect(response.body.user.email).toBe('john@doe.com')
    expect(response.body.user.createdAt).toBeDefined()
  })

  it('(POST /user) with duplicate email should return an error message', async () => {
    const payload = { name: 'John Doe', email: 'john@doe.com' }
    const response = await request(app).post('/user')
      .send(payload)

    expect(response.status).toBe(422)
    expect(response.body.message).toEqual('Invalid data')
    expect(response.body.type).toEqual('validation')
    expect(response.body.errors).toEqual({
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

    expect(response.status).toBe(422)
    expect(response.body.message).toEqual('Invalid body data')
    expect(response.body.type).toEqual('validation')
    expect(response.body.errors).toEqual({
      email: {
        message: 'Email is not a valid email',
        validator: 'email'
      },
    })
  })

  it('(Get /user/:id) with valid params should return an user payload', async () => {
    const id = 2
    const response = await request(app).get(`/user/${id}`)

    expect(response.status).toBe(200)
    expect(response.body.page).toEqual('User')
    expect(response.body.user.name).toBe('John Doe')
    expect(response.body.user.email).toBe('john@doe.com')
    expect(response.body.user.createdAt).toBeDefined()
  })

  it('(Get /user/:id) with invalid id param should return an error message', async () => {
    const id = 30
    const response = await request(app).get(`/user/${id}`)

    expect(response.status).toBe(422)
    expect(response.body.message).toEqual('User does not exist')
  })
})
