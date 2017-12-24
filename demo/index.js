/**
 * Demo server
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio from '../src'
import routes from './routes'

const app = expressio({
  rootPath: __dirname,
})

app.use(routes)
app.startServer()

export default app
