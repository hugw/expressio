export default (mongoose, Schema) => {
  const User = new Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hidden: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
  }, {
    filter: ['hidden']
  })

  return mongoose.model('User', User)
}
