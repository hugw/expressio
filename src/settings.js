/**
 * Default settings
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { CURRENT_ENV } from 'isenv'

export default {
  address: '127.0.0.1',
  authorization: {
    enabled: true,
    ignorePaths: []
  },
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  db: {
    enabled: false,
    development: {
      dialect: 'sqlite',
      storage: 'development.sqlite',
    },
    test: {
      dialect: 'sqlite',
      storage: 'test.sqlite',
      logging: false
    },
    production: {
      dialect: 'sqlite',
      storage: 'production.sqlite',
      logging: false
    }
  },
  env: CURRENT_ENV,
  port: 4000,
  reqNode: { minor: 6, major: 8 },
  rootPath: null,
  secret: 'Default secret key'
}
