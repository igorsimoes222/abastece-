export enum StatusAutorizacao {
  PENDENTE = 'pendente',
  LIBERADA = 'liberada',
  CONCLUIDA = 'concluida',
  EXPIRADA = 'expirada',
  CANCELADA = 'cancelada',
}

export enum StatusPagamento {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  RECUSADO = 'recusado',
  ESTORNADO = 'estornado',
}

export enum FormaPagamento {
  CREDITO = 'credito',
  DEBITO = 'debito',
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
}

// Confirmada pelo callback/deep link que o banco devolve após o cliente
// concluir o fluxo na tela dele — o app nunca decide esse status sozinho.
export enum StatusPreAutorizacao {
  PENDENTE = 'pendente',
  ENVIADA_AO_BANCO = 'enviada_ao_banco',
  ATIVA = 'ativa',
  CANCELAMENTO_SOLICITADO = 'cancelamento_solicitado',
  CANCELADA = 'cancelada',
  EXPIRADA = 'expirada',
  UTILIZADA = 'utilizada',
}

export enum StatusDevendo {
  PENDENTE = 'pendente',
  QUITADO = 'quitado',
}

export enum TipoLancamentoCarteira {
  ABASTECIMENTO = 'abastecimento',
  CASHBACK = 'cashback',
  AJUSTE = 'ajuste',
}
