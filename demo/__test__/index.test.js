/**
 * Demo test coverage
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import request from 'supertest'

import app from '../'

describe('Demo routes', () => {
  afterAll(() => {
    app.close()
  })

  it('root path should response with GET method', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Home' })
  })

  it('/demo path should response with GET method', async () => {
    const response = await request(app).get('/demo')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ page: 'Demo' })
  })
})
