// Orquestra Veiculo + Abastecimento — é o que conecta o limite mensal do
// veículo (perfil PJ) ao abastecimento de fato.
class FrotaService {
  registrarAbastecimentoNoVeiculo(veiculo, abastecimento) {
    veiculo.registrarGasto(abastecimento.valor);
  }
}

module.exports = { FrotaService };
