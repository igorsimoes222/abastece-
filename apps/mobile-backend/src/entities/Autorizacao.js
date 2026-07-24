const { StatusAutorizacao } = require('../shared/Enums');

// Autorização de BICO (libera a bomba via o agente do posto) — não confundir
// com PreAutorizacaoPagamento, que é a garantia de limite no cartão feita
// diretamente na tela do banco.
class Autorizacao {
  constructor(props) {
    this.id = props.id;
    this.clienteId = props.clienteId;
    this.bicoId = props.bicoId;
    this.valor = props.valor;
    this.data = props.data;
    this.status = StatusAutorizacao.PENDENTE;
  }

  liberar() {
    if (this.status !== StatusAutorizacao.PENDENTE) {
      throw new Error(`Não é possível liberar uma autorização com status "${this.status}"`);
    }
    this.status = StatusAutorizacao.LIBERADA;
  }

  concluir() {
    if (this.status !== StatusAutorizacao.LIBERADA) {
      throw new Error('Só é possível concluir uma autorização liberada');
    }
    this.status = StatusAutorizacao.CONCLUIDA;
  }

  cancelar() {
    if (this.status === StatusAutorizacao.CONCLUIDA) {
      throw new Error('Autorização já concluída não pode ser cancelada');
    }
    this.status = StatusAutorizacao.CANCELADA;
  }

  podeGerarAbastecimento() {
    return this.status === StatusAutorizacao.LIBERADA;
  }
}

module.exports = { Autorizacao };
