const { StatusDevendo } = require('../shared/Enums');

class Devendo {
  constructor(props) {
    this.id = props.id;
    this.pagamentoId = props.pagamentoId;
    this.valorDevido = props.valorDevido;
    this.dataOcorrencia = new Date();
    this.status = StatusDevendo.PENDENTE;
  }

  quitar() {
    this.status = StatusDevendo.QUITADO;
  }
}

module.exports = { Devendo };
