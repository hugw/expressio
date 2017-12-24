/**
 * Default settings
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { CURRENT_ENV } from 'isenv'

export default {
  address: process.env.SERVER_ADDRESS || '127.0.0.1',
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
    dialect: 'sqlite',
    storage: 'default.sqlite'
  },
  env: CURRENT_ENV,
  port: process.env.PORT || '4000',
  reqNode: { minor: 6, major: 8 },
  rootPath: null,
  secret: process.env.SECRET || 'Default secret key'
}