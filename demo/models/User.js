import { mongoose } from '../../src'

const User = new mongoose.Schema({
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

export default mongoose.model('User', User)
