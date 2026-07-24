const { FormaPagamento, StatusPagamento } = require('../shared/Enums');

class Pagamento {
  constructor(props) {
    this.id = props.id;
    this.abastecimentoId = props.abastecimentoId;
    this.forma = props.forma;
    this.valor = props.valor;
    this.status = StatusPagamento.PENDENTE;
    this.idTransacaoBanco = undefined;
    this.dataPagamento = undefined;
  }

  // Crédito/débito/pix são autorizados na tela do próprio banco — o app só
  // recebe a confirmação de volta (callback/deep link) e registra aqui.
  confirmarViaBanco(idTransacaoBanco) {
    if (this.forma === FormaPagamento.DINHEIRO) {
      throw new Error('Pagamento em dinheiro não passa por transação bancária');
    }
    this.idTransacaoBanco = idTransacaoBanco;
    this.status = StatusPagamento.APROVADO;
    this.dataPagamento = new Date();
  }

  registrarPagamentoDireto() {
    if (this.forma !== FormaPagamento.DINHEIRO) {
      throw new Error('Este método é exclusivo para pagamento direto no posto (dinheiro)');
    }
    this.status = StatusPagamento.APROVADO;
    this.dataPagamento = new Date();
  }

  recusar() {
    this.status = StatusPagamento.RECUSADO;
  }
}

module.exports = { Pagamento };
