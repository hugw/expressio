import expressio, { httpError } from '@'

const app = expressio()

app.post('/user', async (req, res) => {
  const { body, models } = req
  const user = await models.User.create({ ...body })
  res.json(user)
})

app.get('/user/:id', async (req, res) => {
  const { params, models } = req
  const user = await models.User.findById(params.id)

  if (!user) throw httpError(400, { message: 'User does not exist' })
  res.json(user)
})

export default app
