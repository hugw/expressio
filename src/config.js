/**
 * Default config
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import { ENV } from 'ndtk'

export default {
  default: {
    // Application settings
    app: {},

    // Host
    address: process.env.SERVER_ADDRESS || '127.0.0.1',
    port: process.env.PORT || '4000',

    // Required Node version
    engine: 8.11,

    // Current environment
    env: ENV,

    // CORS
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },

    // Logger
    logger: {
      silent: false,
      level: 'info',
      prettify: true,
    },

    // JWT authentication
    jwt: {
      enabled: true,
      expiresIn: '7d',
      algorithm: 'HS256',
      secret: process.env.SECRET || 'cAQk{m04|:b&MCkD2T0S3C!Da$dko7{EN/gtoH{UO:EM`zdGc-~O>U@$yhz.UDA',
    },

    // Mailer
    mailer: {
      enabled: true,
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ifzm25yindrz6qe3@ethereal.email',
          pass: 'HnUBg7NPc2vaCA79FR',
        },
      },
      defaults: {
        from: '"Expressio App" <expressio@domain.com>',
      },
    },

    // Sequelize adapter
    database: {
      enabled: false,
      dialect: 'sqlite', // "sqlite" or "postgres",
      connection: 'development.sqlite',
      ssl: false, // For postgres adapter
    },
  },

  // Test environment
  test: {
    port: null, // Enable autobind ports to avoid colisions
    logger: {
      silent: true,
    },
    database: {
      connection: 'test.sqlite',
    },
  },

  // Production environment
  production: {
    logger: {
      prettify: false,
    },
    database: {
      connection: 'production.sqlite',
    },
  },
}
