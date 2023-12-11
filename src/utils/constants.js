const UUID_V4_REGEX = '[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}';

const QUERY_PARAMS_KEYS = {
  ID: 'id',
  NUMERO: 'numero',
  PUBLICACAO: 'publicacao',
  ASSUNTO: 'assunto',
  LINK: 'link',
  CLASSIFICACAO: 'classificacao',
  PERMANENTE: 'permanente',
  SITUACAO: 'situacao',
  VALIDADE: 'validade',
  SERVIDORES: 'servidores',
  ALTERACOES: 'alteracoes',
};

const LIKE_FIELDS = [
  QUERY_PARAMS_KEYS.NUMERO,
  QUERY_PARAMS_KEYS.PUBLICACAO,
  QUERY_PARAMS_KEYS.ASSUNTO,
  // QUERY_PARAMS_KEYS.SERVIDORES,
];

const EXACT_OR_IN_FIELDS = [
  QUERY_PARAMS_KEYS.ID,
  QUERY_PARAMS_KEYS.CLASSIFICACAO,
  QUERY_PARAMS_KEYS.PERMANENTE,
  QUERY_PARAMS_KEYS.SITUACAO,
];

const CLASSIFICACAO_MAP = {
  m: 'mandato',
  f: 'fiscalizacao',
  r: 'revogacao',
  c: 'comissao',
  s: 'substituicao',
};

module.exports = {
  LIKE_FIELDS,
  UUID_V4_REGEX,
  CLASSIFICACAO_MAP,
  QUERY_PARAMS_KEYS,
  EXACT_OR_IN_FIELDS,
};
