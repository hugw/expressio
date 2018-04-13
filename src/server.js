/**
 * Server API
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import logger from './logger'

export default (app, config) => {
  const server = {}

  /**
   * Server Instance
   */
  server.instance = null

  /**
   * Start server
   */
  server.start = () => new Promise((res) => {
    if (server.instance) return res('Server already running')

    server.instance = app.listen(config.port, config.address, () => {
      const { address, port } = server.instance.address()
      logger.info(`Server running → ${address}:${port} @ ${config.env}`)
      return res('Server started')
    })
  })

  /**
   * Stop server
   */
  server.stop = () => {
    if (server.instance) server.instance.close()
    server.instance = null
  }

  return server
}
