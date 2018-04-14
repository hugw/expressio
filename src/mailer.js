/**
 * Mailer
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import nodemailer from 'nodemailer'
import logger from './logger'

export default ({ mailer: config }) => {
  // @TODO Check if config object is valid
  const transporter = nodemailer.createTransport(config)

  transporter.dispatch = opts => async () => {
    transporter.sendMail(opts, (error, info) => {
      if (error) {
        logger.debug(error)
        throw error // @TODO Handle mailer errors
      }

      const mailInfo = JSON.stringify({
        ...info,
        text: opts.text || '',
        html: opts.html || ''
      })

      const url = nodemailer.getTestMessageUrl(info)

      logger.info(`Mail response → ${mailInfo}.`)
      if (url) logger.info(`Mail url → ${url}.`)

      return info
    })
  }

  return transporter
}
