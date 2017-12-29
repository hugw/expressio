/**
 * Demo routes
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import express from 'express'
import { validate, dataTypes, controller } from '../src'

const routes = express()

routes.get('/', (req, res) => {
  res.json({ page: 'Home', appName: req.xp.config.appName })
})

routes.get('/public', (req, res) => {
  res.json({ page: 'Public' })
})

routes.get('/unauthorized', (req, res) => {
  res.json({ page: 'Unauthorized' })
})

routes.get('/authorized', (req, res) => {
  res.json({ page: 'Authorized', user: req.user })
})

const article = dataTypes.object().keys({
  title: dataTypes.string().min(3).required(),
  description: dataTypes.string().required(),
})

routes.post('/article', validate(article), (req, res) => {
  res.json({ page: 'Article', ...req.body })
})

routes.get('/config', (req, res) => {
  const config = Object.keys(req.xp)
  res.json({ page: 'Config', config })
})

routes.post('/user', (req, res, next) => {
  const { models: { User } } = req.xp

  User.create({ ...req.body }, (err, user) => {
    if (err) return next(err)
    res.json({ page: 'User', user })
  })
})

routes.get('/custom-error', (req, res, next) => {
  const { reqError } = req.xp

  next(reqError(400, {
    errors: {
      key: 'something wrong with this key'
    }
  }))
})

routes.get('/controller', controller(async (req, res) => {
  const promise = await Promise.resolve('wait a bit')
  res.json({ page: 'Controller', promise })
}))

routes.post('/controller', controller(async () => {
  throw new Error()
}))

export default routes
