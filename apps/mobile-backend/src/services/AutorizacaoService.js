const { Abastecimento } = require('../entities/Abastecimento');

// Orquestra Autorizacao + Abastecimento — nenhuma das duas classes sabe da
// outra sozinha; quem liga as duas é este service.
class AutorizacaoService {
  liberar(autorizacao) {
    autorizacao.liberar();
  }

  iniciarAbastecimento(props) {
    if (!props.autorizacao.podeGerarAbastecimento()) {
      throw new Error('Autorização precisa estar liberada para iniciar um abastecimento');
    }
    if (props.valor.maiorQue(props.autorizacao.valor)) {
      throw new Error('Abastecimento não pode ultrapassar o valor autorizado no bico');
    }

    const abastecimento = new Abastecimento({
      id: props.id,
      autorizacaoId: props.autorizacao.id,
      bicoId: props.autorizacao.bicoId,
      data: props.data,
      litros: props.litros,
      valor: props.valor,
      sequencial: props.sequencial,
    });

    props.autorizacao.concluir();
    return abastecimento;
  }
}

module.exports = { AutorizacaoService };
