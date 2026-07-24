const { Money } = require('../shared/Money');

class Abastecimento {
  #pagamentos = [];

  constructor(props) {
    this.id = props.id;
    this.autorizacaoId = props.autorizacaoId;
    this.bicoId = props.bicoId;
    this.data = props.data;
    this.litros = props.litros;
    this.valor = props.valor;
    this.sequencial = props.sequencial;
  }

  get listaPagamentos() {
    return this.#pagamentos;
  }

  // Suporta split (parte no cartão, parte em cashback etc.) — a soma dos
  // pagamentos nunca pode ultrapassar o valor do abastecimento.
  adicionarPagamento(pagamento) {
    const totalComNovo = this.valorPago().somar(pagamento.valor);
    if (totalComNovo.maiorQue(this.valor)) {
      throw new Error('Soma dos pagamentos não pode ultrapassar o valor do abastecimento');
    }
    this.#pagamentos.push(pagamento);
  }

  valorPago() {
    return this.#pagamentos.reduce((total, p) => total.somar(p.valor), Money.zero());
  }

  estaQuitado() {
    return this.valorPago().maiorOuIgualA(this.valor);
  }

  saldoDevedor() {
    return this.valor.subtrair(this.valorPago());
  }
}

module.exports = { Abastecimento };
