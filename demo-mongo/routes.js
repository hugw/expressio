/**
 * Demo routes
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { router, httpError, controller } from '../src'
import User from './models/User'

const routes = router()

routes.get('/', controller({
  handler: (req, res) => {
    res.json({ page: 'Home', app: req.config.name })
  }
}))

routes.get('/public', controller({
  handler: (req, res) => {
    res.json({ page: 'Public' })
  }
}))

routes.get('/unauthorized', controller((req, res) => {
  res.json({ page: 'Unauthorized' })
}))

routes.get('/authorized', controller({
  handler: (req, res) => {
    res.json({ page: 'Authorized', user: req.user })
  }
}))

routes.post('/user', controller({
  handler: async (req, res) => {
    const { body } = req
    const user = await User.create({ ...body })
    res.json({ page: 'User', user })
  },
  schema: {
    body: {
      name: {
        label: 'Name',
        validate: {}
      },
      email: {
        label: 'Email',
        validate: {
          email: true
        }
      },
    }
  }
}))

routes.get('/forbidden', controller({
  handler: () => {
    throw httpError(403, { message: 'Oops!' })
  }
}))

export default routes
