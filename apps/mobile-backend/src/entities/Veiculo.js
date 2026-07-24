const { Money } = require('../shared/Money');

class Veiculo {
  #gastoNoMes = Money.zero();

  constructor(props) {
    this.id = props.id;
    this.frotaId = props.frotaId;
    this.placa = props.placa.toUpperCase();
    this.modelo = props.modelo;
    this.tipoCombustivel = props.tipoCombustivel;
    this.limiteMensal = props.limiteMensal;
  }

  get gastoAtualNoMes() {
    return this.#gastoNoMes;
  }

  registrarGasto(valor) {
    const totalComNovo = this.#gastoNoMes.somar(valor);
    if (totalComNovo.maiorQue(this.limiteMensal)) {
      throw new Error(`Abastecimento excede o limite mensal do veículo ${this.placa}`);
    }
    this.#gastoNoMes = totalComNovo;
  }

  resetarGastoMensal() {
    this.#gastoNoMes = Money.zero();
  }
}

module.exports = { Veiculo };
