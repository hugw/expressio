/**
 * Logger formatter
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import chalk from 'chalk'
import util from 'util'
import isObject from 'lodash/isObject'
import rd from 'redact-secrets'

const redact = rd('[REDACTED]')

// Update inspect colors
util.inspect.styles.string = 'white'
const inspectOptions = { colors: true, depth: null, compact: false }

const isError = e => e && e.stack && e.message && typeof e.stack === 'string' && typeof e.message === 'string'

function parseJSON(string) {
  try {
    const content = JSON.parse(string)
    if (content && typeof content === 'object') return content
  } catch (e) {} // eslint-disable-line

  return string
}

// Request status code
const reqStatus = (info) => {
  const { status } = info
  let color = chalk.red

  if (status < 400) color = chalk.green
  if (status >= 400 && status < 500) color = chalk.yellow

  return color(status)
}

// Request extras (size / type / time)
const reqExtras = (info) => {
  const { time, size, type } = info

  const sizeLabel = size ? `/ ${size}b` : ''
  const typeLabel = type ? `/ ${type}` : ''
  return chalk.gray(`${time}ms ${sizeLabel} ${typeLabel}`)
}

// Request response
const reqRes = (info, prettify) => {
  // Parse response if JSON
  const parsed = parseJSON(info.response)
  const string = isObject(parsed) ? JSON.stringify(parsed) : parsed
  const response = prettify ? util.inspect(parsed, inspectOptions) : string

  return chalk.gray(`\n Response → ${response}`)
}

// Request payload
const reqPayload = (info, prettify) => {
  const redactedBody = redact.map(info.payload)
  const payload = prettify ? util.inspect(redactedBody, inspectOptions) : JSON.stringify(redactedBody)

  return chalk.gray(`\n Payload → ${payload}`)
}

/**
 * Main formatter
 */
export default (info, { prettify }) => {
  /**
   * Errors
   */
  if (isError(info)) {
    const message = chalk.red(info.message)

    // Remove first line (duplicate of message)
    const lines = info.stack.substring(info.stack.indexOf('\n') + 1)
    const stack = chalk.red(lines)

    return `${message} \n${stack}`
  }

  /**
   * Request
   */
  if (isObject(info) && info.isReq) {
    const status = reqStatus(info)
    const extras = reqExtras(info)
    const response = reqRes(info, prettify)
    const payload = reqPayload(info, prettify)

    const {
      method,
      path,
    } = info

    return `${method} ${path}  ${status}  ${extras} ${payload} ${response}`
  }

  /**
   * Objects
   */
  if (isObject(info)) {
    const redactedObject = redact.map(info)
    const message = prettify ? util.inspect(redactedObject, inspectOptions) : JSON.stringify(redactedObject)
    return chalk.gray(message)
  }

  return info
}
