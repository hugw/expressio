import expressio from '@'

const app = expressio()

app.jwt.setup({
  // ignore paths
  path: ['/public'],
})

app.get('/private', (req, res) => {
  res.json(req.user)
})

app.get('/public', (req, res) => {
  res.status(204)
  res.json()
})


export default app
