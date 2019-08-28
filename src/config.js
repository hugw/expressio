/**
 * Default configs
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import { ENV } from 'ndtk'

export default {
  default: {
    // Core related settings
    // Server / Cors / Node Version
    core: {
      address: process.env.SERVER_ADDRESS || '0.0.0.0',
      port: process.env.PORT || '4000',
      engine: 10.16,
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
        level: 'info',
        silent: false,
        prettify: true,
        transports: {
          console: true,
          file: true,
        },
      },
    },
  },

  // Test environment
  test: {
    core: {
      port: null, // Enable autobind ports to avoid colisions
      logger: {
        level: 'error',
      },
    },
  },

  // Production environment
  production: {
    core: {
      logger: {
        prettify: false,
      },
    },
  },
}
