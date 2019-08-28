/**
 * Logger Middleware
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - contact@hugw.io
 * @license MIT
 */

export default (req, res, next) => {
  const { logger } = req.app

  const startTime = new Date()

  const { end } = res
  res.end = (chunk, encoding) => {
    res.end = end
    res.end(chunk, encoding)

    const { method } = req
    const payload = req.body
    const path = req.originalUrl || req.url
    const time = new Date() - startTime
    const status = res.statusCode
    const size = res._headers['content-length'] // eslint-disable-line
    const type = res._headers['content-type'] // eslint-disable-line
    const body = chunk

    let logLevel = logger.info
    if (status >= 400) logLevel = logger.warn
    if (status >= 500) logLevel = logger.error

    logLevel({
      isReq: true,
      method,
      path,
      status,
      time,
      size,
      type,
      payload,
      response: body,
    })
  }

  next()
}
