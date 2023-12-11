const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    alias: 'id',
  },
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    default: 'guest',
    enum: ['guest', 'servidor', 'admin'],
  },
});

module.exports = mongoose.model('User', UserSchema);
