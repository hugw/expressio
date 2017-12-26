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
      '/custom-error'
    ]
  },
  db: {
    enabled: true
  }
}
