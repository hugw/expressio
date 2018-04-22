/**
 * Demo configuration
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

export default {
  base: {
    // App
    name: 'Demo Server',

    // Server
    root: __dirname,
    address: process.env.SERVER_ADDRESS || '127.0.0.1',
    logLevel: 'info',
    port: process.env.PORT || '4000',

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

    // Databases
    mongo: null,

    sequelize: {
      folder: {
        models: 'models',
        db: 'db',
      },
      seed: 'db/seed',
      connection: {
        database: null,
        username: null,
        password: null,
        host: null,
        dialect: 'sqlite',
        storage: 'development.sqlite'
      },
      config: {}
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
    logLevel: 'error',
    sequelize: {
      connection: {
        storage: 'test.sqlite'
      }
    },
  },

  // Production
  production: {}
}
