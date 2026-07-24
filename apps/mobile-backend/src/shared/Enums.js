const StatusAutorizacao = Object.freeze({
  PENDENTE: 'pendente',
  LIBERADA: 'liberada',
  CONCLUIDA: 'concluida',
  EXPIRADA: 'expirada',
  CANCELADA: 'cancelada',
});

const StatusPagamento = Object.freeze({
  PENDENTE: 'pendente',
  APROVADO: 'aprovado',
  RECUSADO: 'recusado',
  ESTORNADO: 'estornado',
});

const FormaPagamento = Object.freeze({
  CREDITO: 'credito',
  DEBITO: 'debito',
  PIX: 'pix',
  DINHEIRO: 'dinheiro',
});

// Confirmada pelo callback/deep link que o banco devolve após o cliente
// concluir o fluxo na tela dele — o app nunca decide esse status sozinho.
const StatusPreAutorizacao = Object.freeze({
  PENDENTE: 'pendente',
  ENVIADA_AO_BANCO: 'enviada_ao_banco',
  ATIVA: 'ativa',
  CANCELAMENTO_SOLICITADO: 'cancelamento_solicitado',
  CANCELADA: 'cancelada',
  EXPIRADA: 'expirada',
  UTILIZADA: 'utilizada',
});

const StatusDevendo = Object.freeze({
  PENDENTE: 'pendente',
  QUITADO: 'quitado',
});

const TipoLancamentoCarteira = Object.freeze({
  ABASTECIMENTO: 'abastecimento',
  CASHBACK: 'cashback',
  AJUSTE: 'ajuste',
});

module.exports = {
  StatusAutorizacao,
  StatusPagamento,
  FormaPagamento,
  StatusPreAutorizacao,
  StatusDevendo,
  TipoLancamentoCarteira,
};
