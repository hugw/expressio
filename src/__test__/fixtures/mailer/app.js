import expressio, { controller } from '@'

const app = expressio()

app.get('/dispatch', controller(async (req, res) => {
  const template = {
    to: 'someone@domain.com',
    subject: 'Subject',
    text: 'Hello There!',
  }

  await req.mailer.dispatch(template)
  res.status(204).json()
}))

export default app
