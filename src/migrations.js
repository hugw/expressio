/**
 * Database: Migrations API
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import Umzug from 'umzug'
import path from 'path'

export default (sequelize, dir, logger) => {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: { sequelize },

    // see: https://github.com/sequelize/umzug/issues/17
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        sequelize.constructor,
        () => {
          throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
        },
      ],
      path: dir,
      pattern: /\.js$/,
    },

    logging: logger.info,
  })

  const api = {}

  /**
   * Status
   */
  api.status = async () => {
    const exec = await umzug.executed()
    const pend = await umzug.pending()
    const iterator = m => ({ ...m, name: path.basename(m.file, '.js') })

    const executed = exec.reverse().map(iterator)
    const pending = pend.map(iterator)

    return { executed, pending }
  }

  /**
   * Down
   */
  api.down = () => umzug.down({ to: 0 })

  /**
   * Up
   */
  api.up = () => umzug.up()

  /**
   * Prev
   */
  api.prev = async () => {
    const { executed } = await api.status()

    if (!executed.length) throw new Error('Already at the initial state')
    const prev = executed[0].name
    return umzug.down({ to: prev })
  }

  /**
   * Next
   */
  api.next = async () => {
    const { pending } = await api.status()

    if (!pending.length) throw new Error('No pending migrations left')
    const next = pending[0].name
    return umzug.up({ to: next })
  }

  /**
   * Summary
   */
  api.summary = async () => {
    const status = await api.status()
    const current = status.executed.length > 0 ? status.executed[0].file : 'no migrations'
    const pending = status.pending.map(m => m.file).join(', ') || 'none'
    const executed = status.executed.map(m => m.file).join(', ') || 'none'
    // @TODO Move to logger formatter
    logger.info('== Summary =======')
    logger.info(`current: ${current}`)
    logger.info(`pending: ${pending}`)
    logger.info(`executed: ${executed}`)
  }

  /**
   * Run
   */
  api.run = async (cmd) => {
    try {
      await api[cmd]()
    } catch (err) {
      logger.error(err)
    } finally {
      await api.summary()
    }
  }

  return api
}
