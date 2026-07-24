const { Money } = require('../shared/Money');
const { ExtratoLancamento } = require('./ExtratoLancamento');
const { TipoLancamentoCarteira } = require('../shared/Enums');

class Carteira {
  #saldoCashback = Money.zero();
  #totalGasto = Money.zero();
  #totalAbastecimentos = 0;
  #extrato = [];

  constructor(props) {
    this.id = props.id;
    this.clienteId = props.clienteId;
  }

  get saldo() {
    return this.#saldoCashback;
  }

  get quantidadeAbastecimentos() {
    return this.#totalAbastecimentos;
  }

  get gastoAcumulado() {
    return this.#totalGasto;
  }

  get lancamentos() {
    return this.#extrato;
  }

  registrarAbastecimento(valorGasto, percentualCashback, referenciaId) {
    // id definitivo de cada lançamento viria do banco — aqui é só uma
    // sequência local pra manter o exemplo autocontido.
    const proximoId = () => `${this.id}-lanc-${this.#extrato.length + 1}`;

    this.#totalGasto = this.#totalGasto.somar(valorGasto);
    this.#totalAbastecimentos += 1;
    this.#extrato.push(new ExtratoLancamento({
      id: proximoId(),
      carteiraId: this.id,
      tipo: TipoLancamentoCarteira.ABASTECIMENTO,
      valor: valorGasto.multiplicarPor(-1),
      descricao: 'Abastecimento',
      referenciaId,
    }));

    const cashback = valorGasto.percentual(percentualCashback);
    this.#saldoCashback = this.#saldoCashback.somar(cashback);
    this.#extrato.push(new ExtratoLancamento({
      id: proximoId(),
      carteiraId: this.id,
      tipo: TipoLancamentoCarteira.CASHBACK,
      valor: cashback,
      descricao: 'Cashback do abastecimento',
      referenciaId,
    }));
  }
}

module.exports = { Carteira };
