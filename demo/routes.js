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

routes.get('/', controller((req, res) => {
  res.json({ page: 'Home', app: req.config.name })
}))

routes.get('/public', controller((req, res) => {
  res.json({ page: 'Public' })
}))

routes.get('/unauthorized', controller((req, res) => {
  res.json({ page: 'Unauthorized' })
}))

routes.get('/authorized', controller((req, res) => {
  res.json({ page: 'Authorized', user: req.user })
}))

routes.post('/user', controller(async (req, res) => {
  const body = await req.validateBody({
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
  })

  const user = await User.create({ ...body })
  res.json({ page: 'User', user })
}))

routes.get('/forbidden', controller(() => {
  throw httpError(403, { message: 'Oops!' })
}))

export default routes
