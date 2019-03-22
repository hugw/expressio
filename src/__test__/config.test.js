import config from '@/config'

describe('Expressio / Configs', () => {
  it('should match a valid config object', () => {
    expect(config).toEqual({
      default: {
        app: {},
        address: '127.0.0.1',
        port: '4000',
        engine: 8.11,
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
        jwt: {
          enabled: true,
          expiresIn: '7d',
          algorithm: 'HS256',
          secret: process.env.SECRET || 'cAQk{m04|:b&MCkD2T0S3C!Da$dko7{EN/gtoH{UO:EM`zdGc-~O>U@$yhz.UDA',
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
