import expressio, { httpError } from '@'

const app = expressio()
const subApp = expressio({ name: 'subApp' })

app.get('/async', async () => {
  throw httpError(400, { message: 'Ops from async route' })
})

app.get('/sync', () => {
  throw httpError(400, { message: 'Ops from sync route' })
})

subApp.get('/', async (req, res) => {
  res.json({})
})

app.use('/sub-app', subApp)

export default app
