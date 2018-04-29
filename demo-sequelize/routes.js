/**
 * Demo routes
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { router, httpError, controller } from '../src'

const routes = router()

routes.post('/user', controller({
  handler: async (req, res) => {
    const { body, models } = req
    const user = await models.User.create({ ...body })
    res.json({ page: 'User', user })
  },
  schema: {
    body: {
      name: {
        label: 'Name',
        sanitize: {
          trim: true,
        },
        validate: {}
      },
      email: {
        label: 'Email',
        sanitize: {
          lowercase: true,
        },
        validate: {
          email: true
        }
      },
    }
  }
}))

routes.get('/user/:id', controller({
  handler: async (req, res) => {
    const { params, models } = req
    const user = await models.User.findById(params.id)
    if (!user) throw httpError(422, { message: 'User does not exist' })
    res.json({ page: 'User', user })
  },
  schema: {
    params: {
      id: {
        label: 'Id',
        validate: {
          numericality: true
        }
      },
    }
  }
}))

export default routes
