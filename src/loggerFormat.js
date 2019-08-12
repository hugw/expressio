/**
 * Logger formatters
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import { format } from 'winston'
import chalk from 'chalk'
import util from 'util'
import isObject from 'lodash/isObject'

const isError = e => e && e.stack && e.message && typeof e.stack === 'string' && typeof e.message === 'string'

function parseJSON(string) {
  try {
    const content = JSON.parse(string)
    if (content && typeof content === 'object') return content
  } catch (e) {} // eslint-disable-line

  return string
}

const formatters = {
  // Timestamps
  timestamp: format((info) => {
    const date = new Date().toISOString()
    return { ...info, timestamp: chalk.grey(date) }
  }),

  // Levels
  level: format((info) => {
    const { level } = info

    const color = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.green,
      verbose: chalk.blue,
      debug: chalk.cyan,
      silly: chalk.magenta,
    }

    return { ...info, level: color[level](`[${level}]`) }
  }),

  // Errors
  error: format((info) => {
    if (isError(info)) {
      const message = chalk.red(info.message)

      // Remove first line (duplicate of message)
      const lines = info.stack.substring(info.stack.indexOf('\n') + 1)
      const stack = chalk.red(lines)

      return {
        ...info,
        message: `${message} \n${stack}`,
      }
    }

    return info
  }),

  // Request status code
  reqStatus: format((info) => {
    if (!info.req) return info

    const { status } = info.req
    let color = chalk.red

    if (status < 400) color = chalk.green
    if (status >= 400 && status < 500) color = chalk.yellow

    return { ...info, req: { ...info.req, status: color(status) } }
  }),

  // Request extras (size / type / time)
  reqExtras: format((info) => {
    if (!info.req) return info

    const { time, size, type } = info.req

    const sizeLabel = size ? `/ ${size}b` : ''
    const typeLabel = type ? `/ ${type}` : ''
    const extras = chalk.gray(`${time}ms ${sizeLabel} ${typeLabel}`)
    return { ...info, req: { ...info.req, extras } }
  }),

  // Request payload & responses
  reqBody: format((info) => {
    if (!info.req) return info

    const { payload } = info.req

    // Parse response if JSON
    const response = parseJSON(info.req.response)

    const { prettify } = info.options
    const opts = {
      colors: true,
      depth: null,
      compact: false,
      ...(!prettify ? { breakLength: Infinity } : {}),
    }

    // Update inspect colors
    util.inspect.styles.string = 'white'

    return {
      ...info,
      req: {
        ...info.req,
        payload: chalk.gray(`\n Payload → ${util.inspect(payload, opts)}`),
        response: chalk.gray(`\n Response → ${util.inspect(response, opts)}`),
      },
    }
  }),

  // Request
  req: format((info) => {
    if (!info.req) return info

    const {
      method,
      path,
      status,
      extras,
      payload,
      response,
    } = info.req

    const message = `${method} ${path}  ${status}  ${extras} ${payload} ${response}`

    return { ...info, message }
  }),

  // Request
  object: format((info) => {
    if (isObject(info.message)) {
      const opts = {
        colors: true,
        depth: null,
        compact: false,
      }

      // Update inspect colors
      util.inspect.styles.string = 'white'

      return { ...info, message: chalk.gray(util.inspect(info.message, opts)) }
    }

    return info
  }),
}

export default format.combine(
  formatters.error(),
  formatters.timestamp(),
  formatters.level(),

  // Request / Response
  formatters.reqStatus(),
  formatters.reqExtras(),
  formatters.reqBody(),
  formatters.req(),
  formatters.object(),

  // Print message
  format.printf(info => `${info.timestamp} ${info.level} ${info.message}`),
)
