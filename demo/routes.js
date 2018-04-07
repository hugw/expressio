/**
 * Demo routes
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import express from 'express'
import { middlewares, errorHandlers } from '../src'
import User from './models/User'

const { validationError, generalError } = errorHandlers
const { validate, controller } = middlewares

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

const articleSchema = {
  title: {
    label: 'Title',
    rules: {
      presence: { allowEmpty: false },
      length: { minimum: 3 }
    }
  },
  description: {
    label: 'Description',
    rules: {
      presence: { allowEmpty: false }
    }
  }
}

routes.post('/article', validate(articleSchema), (req, res) => {
  res.json({ page: 'Article', ...req.body })
})

routes.get('/config', (req, res) => {
  const config = Object.keys(req.xp)
  res.json({ page: 'Config', config })
})

const userSchema = {
  name: {
    label: 'Name',
    rules: {}
  },
  email: {
    label: 'Email',
    rules: {
      email: true
    }
  },
  hidden: {
    label: 'Hidden',
    rules: {}
  },
}

routes.post('/user', validate(userSchema), (req, res, next) => {
  User.create({ ...req.body }, (err, user) => {
    if (err) return next(err)
    res.json({ page: 'User', user })
  })
})

routes.get('/custom-error', () => {
  throw validationError({
    key: 'something wrong with this key'
  })
})

routes.get('/controller', controller(async (req, res) => {
  const promise = await Promise.resolve('wait a bit')
  res.json({ page: 'Controller', promise })
}))

routes.post('/controller', controller(async () => {
  throw generalError()
}))

export default routes
