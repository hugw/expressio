/**
 * App
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio from '../src'
import routes from './routes'

const app = expressio(__dirname)

app.use(routes)

export default app
