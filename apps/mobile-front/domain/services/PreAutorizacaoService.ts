import { PreAutorizacaoPagamento } from '../entities/PreAutorizacaoPagamento';
import { Abastecimento } from '../entities/Abastecimento';
import { Pagamento } from '../entities/Pagamento';
import { FormaPagamento } from '../shared/Enums';

export interface ConfirmarAbastecimentoComPreAutorizacaoProps {
  preAutorizacao: PreAutorizacaoPagamento;
  abastecimento: Abastecimento;
  pagamentoId: string;
}

// Orquestra PreAutorizacaoPagamento + Abastecimento + Pagamento. Só cartão de
// crédito passa por pré-autorização (regra já validada na PreAutorizacaoScreen).
export class PreAutorizacaoService {
  confirmarAbastecimento(props: ConfirmarAbastecimentoComPreAutorizacaoProps): Pagamento {
    props.preAutorizacao.usarEmAbastecimento(props.abastecimento.valor);

    if (!props.preAutorizacao.idTransacaoBanco) {
      throw new Error('Pré-autorização ativa sem referência de transação bancária — estado inconsistente');
    }

    const pagamento = new Pagamento({
      id: props.pagamentoId,
      abastecimentoId: props.abastecimento.id,
      forma: FormaPagamento.CREDITO,
      valor: props.abastecimento.valor,
    });

    // A garantia de limite já passou pelo banco na pré-autorização — a
    // confirmação final do pagamento reaproveita a mesma referência.
    pagamento.confirmarViaBanco(props.preAutorizacao.idTransacaoBanco);
    props.abastecimento.adicionarPagamento(pagamento);

    return pagamento;
  }
}
