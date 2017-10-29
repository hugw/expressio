/**
 * Demo server
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import expressio from '../src/index'
import routes from './routes'
import settings from './config/settings'

// Create new server instance
const demo = expressio(settings)

// Add routes
demo.use(routes)

// Start server
demo.startServer()

export default demo
