import expressio, { httpError } from '@'

const app = expressio()

app.get('/async', async () => {
  throw httpError(400, { message: 'Ops from async route' })
})

app.get('/sync', () => {
  throw httpError(400, { message: 'Ops from sync route' })
})


export default app
