import { Money } from '../shared/Money';

export interface VeiculoProps {
  id: string;
  frotaId: string;
  placa: string;
  modelo: string;
  tipoCombustivel: string;
  limiteMensal: Money;
}

export class Veiculo {
  readonly id: string;
  readonly frotaId: string;
  readonly placa: string;
  modelo: string;
  tipoCombustivel: string;
  limiteMensal: Money;
  private gastoNoMes: Money = Money.zero();

  constructor(props: VeiculoProps) {
    this.id = props.id;
    this.frotaId = props.frotaId;
    this.placa = props.placa.toUpperCase();
    this.modelo = props.modelo;
    this.tipoCombustivel = props.tipoCombustivel;
    this.limiteMensal = props.limiteMensal;
  }

  get gastoAtualNoMes(): Money {
    return this.gastoNoMes;
  }

  registrarGasto(valor: Money): void {
    const totalComNovo = this.gastoNoMes.somar(valor);
    if (totalComNovo.maiorQue(this.limiteMensal)) {
      throw new Error(`Abastecimento excede o limite mensal do veículo ${this.placa}`);
    }
    this.gastoNoMes = totalComNovo;
  }

  resetarGastoMensal(): void {
    this.gastoNoMes = Money.zero();
  }
}
