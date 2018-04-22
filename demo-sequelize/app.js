/**
 * App
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio from '../src'

import routes from './routes'
import config from './config'

const { app } = expressio(config)

app.use(routes)

export default app
