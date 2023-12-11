const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const { Schema } = mongoose;

const AlteracaoSchema = new Schema({
  situacao: {
    type: String,
    required: true,
    enum: ['altera', 'retifica', 'revoga'],
  },
  idPortaria: {
    type: String,
    required: true,
  },
});

const ServidorSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  presidente: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const PortariaSchema = new Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    alias: 'id',
  },
  // auto incremento CPV.XXXX
  numero: {
    type: String,
    required: true,
  },
  publicacao: {
    type: Date,
    default: () => new Date().getTime(),
    required: true,
  },
  assunto: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  classificacao: {
    type: String,
    required: false,
    enum: ['mandato', 'fiscalizacao', 'revogacao', 'comissao', 'substituicao', ''],
  },
  permanente: {
    type: Boolean,
    required: true,
  },
  situacao: {
    type: String,
    required: true,
    enum: ['vigente', 'alterada', 'revogada', 'extinta'],
  },
  validade: {
    type: String,
    required: false,
  },
  servidores: {
    type: [ServidorSchema],
    required: false,
  },
  alteracoes: {
    type: [AlteracaoSchema],
    required: false,
  },
  ano: {
    type: String,
    required: false,
  },
  createdBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Portaria', PortariaSchema);
