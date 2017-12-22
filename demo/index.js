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
  authorization: {
    ignorePaths: [
      '/',
      '/public',
      '/notfound',
      '/article',
      '/settings',
    ]
  }
})

app.use(routes)

// app.use(authorize({ ignorePath: ['/auth/sign-up', '/auth/sign-in'] }))

// app.post('/auth/sign-up', asyncRoute(async (req, res) => {
//   const { User } = req.models
//   const user = await User.create(req.body)
//   res.json(user)
// }))

// app.post('/auth/sign-in', asyncRoute(async (req, res) => {
//   const { User } = req.models
//   const { password, email } = req.body

//   const user = await User.findOne({ email }).exec()
//   const valid = await user.comparePassword(password)

//   res.json({ user, valid })
// }))

// app.post('/auth/sign-in', (req, res) => {
//   const token = jwt.sign({ foo: 'bar' }, key)

//   res.json({ token })
// })

// app.get('/auth', jwte({ secret: key }), (req, res) => {
//   if (!req.user.foo) res.status(401).json({ error: 'not today' })
//   else res.status(200).json({ today: 'champs' })
// })

// Start server
app.startServer()

export default app
