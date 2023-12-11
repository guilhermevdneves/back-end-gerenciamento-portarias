const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const { Schema } = mongoose;

const PermissaoSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    alias: 'id',
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  role: {
    type: [String],
    enum: ['guest', 'servidor', 'admin'],
    default: ['guest'],
    required: true,
  },
});

module.exports = mongoose.model('Permissao', PermissaoSchema);
