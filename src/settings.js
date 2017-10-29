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
  reqNode: { minor: 6, major: 8 },
  rootPath: null,
  publicDirName: 'public',
  modelsDirName: 'models',
  mongo: true,
  db: {
    development: null,
    staging: null,
    test: null,
    production: null
  }
}
