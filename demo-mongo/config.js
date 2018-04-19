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

    // Database
    mongo: {
      connection: 'mongodb://localhost:27017/demo-development',
      seed: 'db/seed'
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
    mongo: {
      connection: 'mongodb://localhost:27017/demo-test',
    }
  },

  // Production
  production: {
    mongo: {
      connection: 'mongodb://localhost:27017/demo-production',
    }
  }
}
