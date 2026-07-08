import { Money } from '../shared/Money';
import { ExtratoLancamento } from './ExtratoLancamento';
import { TipoLancamentoCarteira } from '../shared/Enums';

export interface CarteiraProps {
  id: string;
  clienteId: string;
}

export class Carteira {
  readonly id: string;
  readonly clienteId: string;
  private saldoCashback: Money = Money.zero();
  private totalGasto: Money = Money.zero();
  private totalAbastecimentos = 0;
  private extrato: ExtratoLancamento[] = [];

  constructor(props: CarteiraProps) {
    this.id = props.id;
    this.clienteId = props.clienteId;
  }

  get saldo(): Money {
    return this.saldoCashback;
  }

  get quantidadeAbastecimentos(): number {
    return this.totalAbastecimentos;
  }

  get gastoAcumulado(): Money {
    return this.totalGasto;
  }

  get lancamentos(): ReadonlyArray<ExtratoLancamento> {
    return this.extrato;
  }

  registrarAbastecimento(valorGasto: Money, percentualCashback: number, referenciaId: string): void {
    // id definitivo de cada lançamento viria do banco — aqui é só uma
    // sequência local pra manter o exemplo autocontido.
    const proximoId = () => `${this.id}-lanc-${this.extrato.length + 1}`;

    this.totalGasto = this.totalGasto.somar(valorGasto);
    this.totalAbastecimentos += 1;
    this.extrato.push(new ExtratoLancamento({
      id: proximoId(),
      carteiraId: this.id,
      tipo: TipoLancamentoCarteira.ABASTECIMENTO,
      valor: valorGasto.multiplicarPor(-1),
      descricao: 'Abastecimento',
      referenciaId,
    }));

    const cashback = valorGasto.percentual(percentualCashback);
    this.saldoCashback = this.saldoCashback.somar(cashback);
    this.extrato.push(new ExtratoLancamento({
      id: proximoId(),
      carteiraId: this.id,
      tipo: TipoLancamentoCarteira.CASHBACK,
      valor: cashback,
      descricao: 'Cashback do abastecimento',
      referenciaId,
    }));
  }
}
