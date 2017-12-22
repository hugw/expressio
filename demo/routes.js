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
  res.json({ page: 'Home' })
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
  res.json({ page: 'Settings', ...req.xp })
})

export default routes
