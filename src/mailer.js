/**
 * Mailer
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

import nodemailer from 'nodemailer'
import Joi from 'joi'

import utils from '@/utils'

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  enabled: Joi.boolean().required(),
  transport: Joi.object().required(),
  defaults: Joi.object({
    from: Joi.string().required(),
  }).required(),
})

export default (server, config) => {
  const {
    enabled,
    transport,
    defaults,
  } = utils.sanitize(config, schema, 'Invalid Mailer config')

  if (!enabled) return
  const transporter = nodemailer.createTransport(transport, defaults)
  const { logger } = server

  /**
   * Dispatch email
   */
  transporter.dispatch = async (msg) => {
    try {
      const info = await transporter.sendMail(msg)

      const response = {
        ...info,
        content: msg.text || msg.html || '',
      }

      const debug = nodemailer.getTestMessageUrl(info) || null

      logger.info(null, {
        mailer: { response, debug },
        options: logger.options,
      })

      return info
    } catch (err) {
      err.message = `Mailer error: ${err.message}`
      throw err
    }
  }

  // Expose Mailer to the server object
  server.mailer = transporter

  // Expose Mailer to the request object
  server.use((req, res, next) => {
    req.mailer = transporter
    next()
  })
}
