const { StatusPreAutorizacao } = require('../shared/Enums');

// Não guarda dados de cartão — o app redireciona o cliente pra tela do banco
// e só recebe de volta a referência da transação (idTransacaoBanco) e o
// status. Só cartão de crédito suporta esse fluxo (regra vinda da UI atual).
class PreAutorizacaoPagamento {
  constructor(props) {
    this.id = props.id;
    this.clienteId = props.clienteId;
    this.postoId = props.postoId;
    this.valorSolicitado = props.valorSolicitado;
    this.validadeHoras = props.validadeHoras ?? 48;
    this.criadaEm = new Date();
    this.valorConfirmado = undefined;
    this.status = StatusPreAutorizacao.PENDENTE;
    this.idTransacaoBanco = undefined;
  }

  confirmarNoBanco(idTransacaoBanco) {
    if (this.status !== StatusPreAutorizacao.PENDENTE && this.status !== StatusPreAutorizacao.ENVIADA_AO_BANCO) {
      throw new Error(`Não é possível confirmar uma pré-autorização com status "${this.status}"`);
    }
    this.idTransacaoBanco = idTransacaoBanco;
    this.status = StatusPreAutorizacao.ATIVA;
  }

  estaExpirada(agora = new Date()) {
    const limiteMs = this.criadaEm.getTime() + this.validadeHoras * 60 * 60 * 1000;
    return agora.getTime() > limiteMs;
  }

  // Só o posto confirma o cancelamento — o app apenas registra a solicitação.
  solicitarCancelamento() {
    if (this.status !== StatusPreAutorizacao.ATIVA) {
      throw new Error('Só é possível solicitar cancelamento de uma pré-autorização ativa');
    }
    this.status = StatusPreAutorizacao.CANCELAMENTO_SOLICITADO;
  }

  confirmarCancelamentoPeloPosto() {
    if (this.status !== StatusPreAutorizacao.CANCELAMENTO_SOLICITADO) {
      throw new Error('Não há cancelamento pendente de confirmação');
    }
    this.status = StatusPreAutorizacao.CANCELADA;
  }

  usarEmAbastecimento(valorConfirmado) {
    if (this.status !== StatusPreAutorizacao.ATIVA) {
      throw new Error('Pré-autorização precisa estar ativa para ser usada');
    }
    if (valorConfirmado.maiorQue(this.valorSolicitado)) {
      throw new Error('Valor do abastecimento não pode ultrapassar o valor pré-autorizado');
    }
    this.valorConfirmado = valorConfirmado;
    this.status = StatusPreAutorizacao.UTILIZADA;
  }
}

module.exports = { PreAutorizacaoPagamento };
