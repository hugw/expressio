/**
 * Demo server
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import path from 'path'
import expressio from '../src/index'
import routes from './routes'

// Create new server instance
const demo = expressio({ publicDir: path.join(__dirname, 'public') })

// Add routes
demo.use(routes)

// Start server
demo.startServer()

export default demo
