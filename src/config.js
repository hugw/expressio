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
    engine: 10.16,

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
  },

  // Test environment
  test: {
    port: null, // Enable autobind ports to avoid colisions
    logger: {
      silent: true,
    },
  },

  // Production environment
  production: {
    logger: {
      prettify: false,
    },
  },
}
