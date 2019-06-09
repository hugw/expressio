import config from '@/config'

describe('Expressio / Configs', () => {
  it('should match a valid config object', () => {
    expect(config).toEqual({
      default: {
        core: {
          address: '0.0.0.0',
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
      },
      test: {
        core: {
          port: null,
          logger: {
            silent: true,
          },
        },
      },
      production: {
        core: {
          logger: {
            level: 'error',
            prettify: false,
          },
        },
      },
    })
  })
})
