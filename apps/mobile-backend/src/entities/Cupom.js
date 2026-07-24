class Cupom {
  constructor(props) {
    this.id = props.id;
    this.pagamentoId = props.pagamentoId;
    this.codigo = props.codigo;
    this.emitidoEm = new Date();
  }
}

module.exports = { Cupom };
