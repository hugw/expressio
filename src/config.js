/**
 * Config variables
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { CURRENT_ENV } from 'isenv'

export default {
  base: {
    // Server
    address: process.env.SERVER_ADDRESS || '127.0.0.1',
    logLevel: 'info',
    port: process.env.PORT || '4000',
    env: CURRENT_ENV,

    // Public folder for static files
    // Define a folder name or null to disable it
    public: 'public',

    // Security
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    },
    secret: process.env.SECRET || 'Default secret key',

    // Database
    database: 'mongo',

    mongo: {
      connection: 'mongodb://localhost:27017/development',
      seed: null
    },

    sequelize: {
      models: 'models',
      connection: {
        host: null,
        username: null,
        password: null,
      },
      config: {
        dialect: 'sqlite',
        storage: 'db/sqlite/development.sqlite'
      }
    },

    // Required Node version
    reqNode: { minor: 6, major: 8 },

    // Mailer
    mailer: {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'yrhxokkz4da2rtlw@ethereal.email',
        pass: 'Eu7ZNpyZYKUyyJNzk9'
      }
    }
  },

  // Test
  test: {
    // mongo: {
    //   connection: 'mongodb://localhost:27017/test',
    // }
  },

  // Production
  production: {
    // mongo: {
    //   connection: 'mongodb://localhost:27017/production',
    // }
  }
}
