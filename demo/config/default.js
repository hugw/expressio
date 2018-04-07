import path from 'path'

export default {
  appName: process.env.APP_NAME,
  authorization: {
    ignorePaths: [
      '/',
      '/public',
      '/notfound',
      '/article',
      '/config',
      '/user',
      '/custom-error',
      '/controller'
    ]
  },
  db: {
    connection: 'mongodb://localhost:27017/demo-development',
    seed: path.join(__dirname, '../db/seed')
  },
}
