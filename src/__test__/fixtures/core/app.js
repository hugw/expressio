import expressio, { httpError } from '@'

const app = expressio()

app.get('/async', async () => {
  throw httpError(400, { message: 'Ops from async route' })
})

app.get('/sync', () => {
  throw httpError(400, { message: 'Ops from sync route' })
})

app.get('/settings', async (req, res) => {
  res.json(req.settings)
})


export default app
