const mongoose = require('mongoose');

const { Schema } = mongoose;

const SequenceSchema = new Schema({
  _id: {
    type: String,
    default: () => `${this.year}-numero`,
    alias: 'id',
    required: true,
    unique: true,
  },
  sequence_value: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Sequence', SequenceSchema);
