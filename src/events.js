/**
 * Async Events
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import ndtk from 'ndtk'

export default (server) => {
  const stack = {}

  /**
   * Register new events
   */
  const on = (event, fn) => {
    ndtk.assert(isString(event) && event.length !== 0, 'Events error: event is not a string')
    ndtk.assert(isFunction(fn), `Events error: "${event}" event has not a valid function`)

    if (!stack[event]) stack[event] = [fn]
    else stack[event] = [...stack[event], fn]
  }

  /**
   * Emit events
   */
  const emit = (event, ...args) => {
    ndtk.assert(isString(event) && event.length !== 0, 'Events error: event is not a string')

    const events = stack[event] || []

    return Promise.all(events.map(fn => fn(server, ...args)))
  }

  // Expose Events Api to the server object
  server.events = { on, emit }
}
