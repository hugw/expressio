/**
 * App
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio, { authorize } from '../src'

import routes from './routes'
import config from './config'

const { app } = expressio(config)

app.use(authorize({
  ignore: [
    '/',
    '/public',
    '/notfound',
    '/forbidden',
    '/user'
  ]
}))

app.use(routes)

export default app
