import { Abastecimento } from '../entities/Abastecimento';
import { Pagamento } from '../entities/Pagamento';
import { Carteira } from '../entities/Carteira';
import { Cupom } from '../entities/Cupom';
import { Devendo } from '../entities/Devendo';
import { FormaPagamento } from '../shared/Enums';

export interface FinalizarAbastecimentoProps {
  abastecimento: Abastecimento;
  carteira: Carteira;
  percentualCashback: number;
  cupomId: string;
  cupomCodigo: string;
  devendoId: string;
}

export interface ResultadoFinalizacaoAbastecimento {
  cupomGerado?: Cupom;
  devendoGerado?: Devendo;
}

// Orquestra Abastecimento + Pagamento + Carteira + Cupom + Devendo.
export class PagamentoAbastecimentoService {
  confirmarPagamentoBancario(abastecimento: Abastecimento, pagamento: Pagamento, idTransacaoBanco: string): void {
    pagamento.confirmarViaBanco(idTransacaoBanco);
    abastecimento.adicionarPagamento(pagamento);
  }

  confirmarPagamentoDireto(abastecimento: Abastecimento, pagamento: Pagamento): void {
    pagamento.registrarPagamentoDireto();
    abastecimento.adicionarPagamento(pagamento);
  }

  // Fecha o ciclo do abastecimento: gera cupom + credita cashback, ou — se
  // sobrou saldo — gera um Devendo. Dinheiro no posto não passa pelo split
  // do app (sem comissão repassada), então não gera cupom nem cashback,
  // igual ao aviso já existente em PagamentoScreen.js ("Nenhum comprovante
  // será emitido pelo app").
  finalizar(props: FinalizarAbastecimentoProps): ResultadoFinalizacaoAbastecimento {
    if (!props.abastecimento.estaQuitado()) {
      const devendo = new Devendo({
        id: props.devendoId,
        pagamentoId: this.ultimoPagamento(props.abastecimento).id,
        valorDevido: props.abastecimento.saldoDevedor(),
      });
      return { devendoGerado: devendo };
    }

    const pagamentoFinal = this.ultimoPagamento(props.abastecimento);
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

  private ultimoPagamento(abastecimento: Abastecimento): Pagamento {
    const pagamentos = abastecimento.listaPagamentos;
    if (pagamentos.length === 0) {
      throw new Error('Abastecimento não tem nenhum pagamento registrado');
    }
    return pagamentos[pagamentos.length - 1];
  }
}
