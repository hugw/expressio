/**
 * Config test coverage
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import config from '../config'

describe('Expressio / Config', () => {
  it('should match a valid config object', () => {
    expect(config).toEqual({
      base: {
        address: '127.0.0.1',
        logLevel: 'info',
        port: '4000',
        env: 'test',
        public: 'public',
        cors: {
          origin: '*',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          preflightContinue: false,
          optionsSuccessStatus: 204
        },
        secret: 'Default secret key',
        mongo: {
          connection: 'mongodb://localhost:27017/development',
          seed: null
        },
        reqNode: { minor: 6, major: 8 },
        mailer: {
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: 'yrhxokkz4da2rtlw@ethereal.email',
            pass: 'Eu7ZNpyZYKUyyJNzk9'
          }
        }
      },
      test: {},
      production: {}
    })
  })
})
