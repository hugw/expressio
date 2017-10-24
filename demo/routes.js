/**
 * Demo routes
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import express from 'express'

const routes = express()

routes.get('/', (req, res) => {
  res.json({ page: 'Home' })
})

routes.get('/demo', (req, res) => {
  res.json({ page: 'Demo' })
})

export default routes
