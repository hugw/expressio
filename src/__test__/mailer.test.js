import request from 'supertest'

import mailer from '@/mailer'
import app from './fixtures/mailer/app'

describe('Expressio / Mailer initializer', () => {
  const use = jest.fn()

  const config = {
    enabled: true,
    transport: {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ifzm25yindrz6qe3@ethereal.email',
        pass: 'HnUBg7NPc2vaCA79FR',
      },
    },
    defaults: {
      from: '"Expressio App" <expressio@domain.com>',
    },
  }

  afterEach(() => {
    use.mockClear()
  })

  it('should load the initializer and expose an api to the server', () => {
    const server = { use }
    mailer(server, config)

    expect(server.mailer.dispatch).toBeTruthy()
    expect(use).toHaveBeenCalledTimes(1)
  })

  it('should not load the initializer and expose an api to the server if enabled is set to "false"', () => {
    const server = { use }
    mailer(server, { ...config, enabled: false })

    expect(server.mailer).toBeFalsy()
    expect(use).toHaveBeenCalledTimes(0)
  })

  it('given no "enabled" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, enabled: undefined })
    expect(fn).toThrow('Invalid Mailer config: "enabled" is required')
  })

  it('given no "transport" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, transport: undefined })
    expect(fn).toThrow('Invalid Mailer config: "transport" is required')
  })

  it('given an invalid "transport" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, transport: null })
    expect(fn).toThrow('Invalid Mailer config: "transport" must be an object')
  })

  it('given no "defaults" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, defaults: undefined })
    expect(fn).toThrow('Invalid Mailer config: "defaults" is required')
  })

  it('given an invalid "defaults" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, defaults: null })
    expect(fn).toThrow('Invalid Mailer config: "defaults" must be an object')
  })

  it('given no "defaults:from" config, it should throw an error with proper message', () => {
    const fn = () => mailer({}, { ...config, defaults: { from: undefined } })
    expect(fn).toThrow('Invalid Mailer config: "from" is required')
  })
})

describe('Expressio / Mailer Demo', () => {
  beforeAll(async () => {
    await app.start()
  })

  afterAll(() => {
    app.stop()
  })

  it('(GET /public) should dispatch an email successfully', async () => {
    const response = await request(app).get('/dispatch')
    expect(response.status).toBe(204)
  }, 10000)
})
