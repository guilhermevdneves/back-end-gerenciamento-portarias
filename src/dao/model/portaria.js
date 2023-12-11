class Portaria {
  constructor(data) {
    const {
      id, numero, publicacao, assunto, link, classificacao,
      permanente, situacao, validade, servidores, alteracoes,
      createdBy, ano,
    } = data;

    this.id = id;
    this.numero = numero;
    this.publicacao = publicacao;
    this.assunto = assunto;
    this.link = link;
    this.classificacao = classificacao;
    this.permanente = permanente;
    this.situacao = situacao;
    this.validade = validade;
    this.servidores = servidores;
    this.alteracoes = alteracoes;
    this.ano = ano;
    this.createdBy = createdBy;
  }

  toJSON() {
    return {
      id: this.id,
      numero: this.numero,
      publicacao: this.publicacao,
      assunto: this.assunto,
      link: this.link,
      classificacao: this.classificacao,
      permanente: this.permanente,
      situacao: this.situacao,
      validade: this.validade,
      servidores: this.servidores,
      alteracoes: this.alteracoes,
      ano: this.ano,
      createdBy: this.createdBy,
    };
  }
}

module.exports = Portaria;
