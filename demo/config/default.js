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
    ]
  },
  db: {
    enabled: true
  }
}
