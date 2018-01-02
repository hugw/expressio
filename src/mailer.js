/**
 * Mailer
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import nodemailer from 'nodemailer'
import { logEvent } from './utils'

export default (cfg) => {
  const transporter = nodemailer.createTransport(cfg)

  transporter.dispatch = opts => new Promise((res, rej) => {
    transporter.sendMail(opts, (error, info) => {
      if (error) return rej(error) // @TODO Handle mailer errors

      const mailInfo = JSON.stringify({
        ...info,
        text: opts.text || '',
        html: opts.html || ''
      })

      const url = nodemailer.getTestMessageUrl(info)

      logEvent(`Mail response → ${mailInfo}`)
      if (url) logEvent(`Mail url → ${url}`)

      return res(info)
    })
  })

  return transporter
}
