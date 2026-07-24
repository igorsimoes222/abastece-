class Motorista {
  constructor(props) {
    this.id = props.id;
    this.frotaId = props.frotaId;
    this.nome = props.nome;
    this.veiculoAtualId = props.veiculoAtualId;
  }

  vincularVeiculo(veiculoId) {
    this.veiculoAtualId = veiculoId;
  }

  desvincularVeiculo() {
    this.veiculoAtualId = undefined;
  }
}

module.exports = { Motorista };
