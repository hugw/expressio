import app from './app'

// Log new token for debugging
const token = app.jwt.sign({ id: 1 })
app.logger.info(`Token: ${token}`)

app.start()
