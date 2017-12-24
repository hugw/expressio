/**
 * Demo routes
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import express from 'express'
import { validate, joi } from '../src'

const routes = express()

routes.get('/', (req, res) => {
  res.json({ page: 'Home', appName: req.xp.settings.appName })
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

const article = joi.object().keys({
  title: joi.string().min(3).required(),
  description: joi.string().required(),
})

routes.post('/article', validate(article), (req, res) => {
  res.json({ page: 'Article', ...req.body })
})

routes.get('/settings', (req, res) => {
  const settings = Object.keys(req.xp)
  res.json({ page: 'Settings', settings })
})

routes.post('/user', (req, res) => {
  const { models: { User } } = req.xp

  User.create({ ...req.body })
    .then((user) => {
      res.json({ page: 'User', user })
    })
})

export default routes
