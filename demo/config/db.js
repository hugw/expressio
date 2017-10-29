/**
 * Database Settings
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'

export default {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db/development.sqlite')
  },
  test: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db/test.sqlite')
  },
  staging: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db/dev.sqlite')
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db/dev.sqlite')
  }
}
