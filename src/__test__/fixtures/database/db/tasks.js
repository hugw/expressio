import app from '../app'

const cmd = process.argv && process.argv[2]
app.database.run(cmd)
