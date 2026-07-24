const { Cupom } = require('../entities/Cupom');
const { Devendo } = require('../entities/Devendo');
const { FormaPagamento } = require('../shared/Enums');

// Orquestra Abastecimento + Pagamento + Carteira + Cupom + Devendo.
class PagamentoAbastecimentoService {
  confirmarPagamentoBancario(abastecimento, pagamento, idTransacaoBanco) {
    pagamento.confirmarViaBanco(idTransacaoBanco);
    abastecimento.adicionarPagamento(pagamento);
  }

  confirmarPagamentoDireto(abastecimento, pagamento) {
    pagamento.registrarPagamentoDireto();
    abastecimento.adicionarPagamento(pagamento);
  }

  // Fecha o ciclo do abastecimento: gera cupom + credita cashback, ou — se
  // sobrou saldo — gera um Devendo. Dinheiro no posto não passa pelo split
  // do app (sem comissão repassada), então não gera cupom nem cashback.
  finalizar(props) {
    if (!props.abastecimento.estaQuitado()) {
      const devendo = new Devendo({
        id: props.devendoId,
        pagamentoId: this.#ultimoPagamento(props.abastecimento).id,
        valorDevido: props.abastecimento.saldoDevedor(),
      });
      return { devendoGerado: devendo };
    }

    const pagamentoFinal = this.#ultimoPagamento(props.abastecimento);
    if (pagamentoFinal.forma === FormaPagamento.DINHEIRO) {
      return {};
    }

    props.carteira.registrarAbastecimento(
      props.abastecimento.valor,
      props.percentualCashback,
      props.abastecimento.id,
    );

    const cupom = new Cupom({
      id: props.cupomId,
      pagamentoId: pagamentoFinal.id,
      codigo: props.cupomCodigo,
    });
    return { cupomGerado: cupom };
  }

  #ultimoPagamento(abastecimento) {
    const pagamentos = abastecimento.listaPagamentos;
    if (pagamentos.length === 0) {
      throw new Error('Abastecimento não tem nenhum pagamento registrado');
    }
    return pagamentos[pagamentos.length - 1];
  }
}

module.exports = { PagamentoAbastecimentoService };
