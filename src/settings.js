/**
 * Default settings
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { CURRENT_ENV } from 'isenv'

export default {
  env: CURRENT_ENV,
  port: 4000,
  address: '127.0.0.1',
  authorization: {
    enabled: true,
    ignorePaths: []
  },
  reqNode: { minor: 6, major: 8 },
  rootPath: null,
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  secret: 'Default secret key'
}
