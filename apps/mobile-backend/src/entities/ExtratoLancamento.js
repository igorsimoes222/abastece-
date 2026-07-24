class ExtratoLancamento {
  constructor(props) {
    this.id = props.id;
    this.carteiraId = props.carteiraId;
    this.tipo = props.tipo;
    this.valor = props.valor;
    this.descricao = props.descricao;
    this.referenciaId = props.referenciaId;
    this.data = new Date();
  }
}

module.exports = { ExtratoLancamento };
