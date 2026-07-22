import { Money } from '../shared/Money';
import { Pagamento } from './Pagamento';

export interface AbastecimentoProps {
  id: string;
  autorizacaoId: string;
  bicoId: string;
  data: Date;
  litros: number;
  valor: Money;
  sequencial: number;
}

export class Abastecimento {
  readonly id: string;
  readonly autorizacaoId: string;
  readonly bicoId: string;
  readonly data: Date;
  readonly litros: number;
  readonly valor: Money;
  readonly sequencial: number;
  private pagamentos: Pagamento[] = [];

  constructor(props: AbastecimentoProps) {
    this.id = props.id;
    this.autorizacaoId = props.autorizacaoId;
    this.bicoId = props.bicoId;
    this.data = props.data;
    this.litros = props.litros;
    this.valor = props.valor;
    this.sequencial = props.sequencial;
  }

  get listaPagamentos(): ReadonlyArray<Pagamento> {
    return this.pagamentos;
  }

  // Suporta split (parte no cartão, parte em cashback etc.) — a soma dos
  // pagamentos nunca pode ultrapassar o valor do abastecimento.
  adicionarPagamento(pagamento: Pagamento): void {
    const totalComNovo = this.valorPago().somar(pagamento.valor);
    if (totalComNovo.maiorQue(this.valor)) {
      throw new Error('Soma dos pagamentos não pode ultrapassar o valor do abastecimento');
    }
    this.pagamentos.push(pagamento);
  }

  valorPago(): Money {
    return this.pagamentos.reduce((total, p) => total.somar(p.valor), Money.zero());
  }

  estaQuitado(): boolean {
    return this.valorPago().maiorOuIgualA(this.valor);
  }

  saldoDevedor(): Money {
    return this.valor.subtrair(this.valorPago());
  }
}
