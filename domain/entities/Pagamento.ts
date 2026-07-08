import { Money } from '../shared/Money';
import { FormaPagamento, StatusPagamento } from '../shared/Enums';

export interface PagamentoProps {
  id: string;
  abastecimentoId: string;
  forma: FormaPagamento;
  valor: Money;
}

export class Pagamento {
  readonly id: string;
  readonly abastecimentoId: string;
  readonly forma: FormaPagamento;
  readonly valor: Money;
  status: StatusPagamento;
  idTransacaoBanco?: string;
  dataPagamento?: Date;

  constructor(props: PagamentoProps) {
    this.id = props.id;
    this.abastecimentoId = props.abastecimentoId;
    this.forma = props.forma;
    this.valor = props.valor;
    this.status = StatusPagamento.PENDENTE;
  }

  // Crédito/débito/pix são autorizados na tela do próprio banco — o app só
  // recebe a confirmação de volta (callback/deep link) e registra aqui.
  confirmarViaBanco(idTransacaoBanco: string): void {
    if (this.forma === FormaPagamento.DINHEIRO) {
      throw new Error('Pagamento em dinheiro não passa por transação bancária');
    }
    this.idTransacaoBanco = idTransacaoBanco;
    this.status = StatusPagamento.APROVADO;
    this.dataPagamento = new Date();
  }

  registrarPagamentoDireto(): void {
    if (this.forma !== FormaPagamento.DINHEIRO) {
      throw new Error('Este método é exclusivo para pagamento direto no posto (dinheiro)');
    }
    this.status = StatusPagamento.APROVADO;
    this.dataPagamento = new Date();
  }

  recusar(): void {
    this.status = StatusPagamento.RECUSADO;
  }
}
