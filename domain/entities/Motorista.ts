export interface MotoristaProps {
  id: string;
  frotaId: string;
  nome: string;
  veiculoAtualId?: string;
}

export class Motorista {
  readonly id: string;
  readonly frotaId: string;
  nome: string;
  veiculoAtualId?: string;

  constructor(props: MotoristaProps) {
    this.id = props.id;
    this.frotaId = props.frotaId;
    this.nome = props.nome;
    this.veiculoAtualId = props.veiculoAtualId;
  }

  vincularVeiculo(veiculoId: string): void {
    this.veiculoAtualId = veiculoId;
  }

  desvincularVeiculo(): void {
    this.veiculoAtualId = undefined;
  }
}
