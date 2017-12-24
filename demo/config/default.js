export default {
  appName: process.env.APP_NAME,
  authorization: {
    ignorePaths: [
      '/',
      '/public',
      '/notfound',
      '/article',
      '/settings',
      '/user',
    ]
  },
  db: {
    enabled: true
  }
}
