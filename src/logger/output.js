/**
 * Logger output
 *
 * @copyright Copyright (c) 2019, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import { format } from 'winston'
import chalk from 'chalk'

const timestamp = format((info) => {
  const date = new Date().toISOString()
  return { ...info, timestamp: chalk.grey(date) }
})

const level = format((info) => {
  const { level: lvl } = info

  const color = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.green,
    verbose: chalk.blue,
    debug: chalk.cyan,
    silly: chalk.magenta,
  }

  return { ...info, level: color[lvl](`[${lvl}]`) }
})

/**
 * Default Winston
 * formatter which includes
 * colored timestamp, level and final message
 */
export default format.combine(
  timestamp(),
  level(),

  // Print message
  format.printf(info => `${info.timestamp} ${info.level} ${info.message}`),
)
