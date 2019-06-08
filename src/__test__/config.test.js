import config from '@/config'

describe('Expressio / Configs', () => {
  it('should match a valid config object', () => {
    expect(config).toEqual({
      default: {
        app: {},
        address: '127.0.0.1',
        port: '4000',
        engine: 10.16,
        env: 'test',
        cors: {
          origin: '*',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          preflightContinue: false,
          optionsSuccessStatus: 204,
        },
        logger: {
          silent: false,
          level: 'info',
          prettify: true,
        },
      },
      test: {
        port: null,
        logger: {
          silent: true,
        },
      },
      production: {
        logger: {
          prettify: false,
        },
      },
    })
  })
})
