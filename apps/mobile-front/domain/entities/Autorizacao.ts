import { Money } from '../shared/Money';
import { StatusAutorizacao } from '../shared/Enums';

// Autorização de BICO (libera a bomba via HORUSTECH) — não confundir com
// PreAutorizacaoPagamento, que é a garantia de limite no cartão feita
// diretamente na tela do banco.
export interface AutorizacaoProps {
  id: string;
  clienteId: string;
  bicoId: string;
  valor: Money;
  data: Date;
}

export class Autorizacao {
  readonly id: string;
  readonly clienteId: string;
  readonly bicoId: string;
  readonly valor: Money;
  readonly data: Date;
  status: StatusAutorizacao;

  constructor(props: AutorizacaoProps) {
    this.id = props.id;
    this.clienteId = props.clienteId;
    this.bicoId = props.bicoId;
    this.valor = props.valor;
    this.data = props.data;
    this.status = StatusAutorizacao.PENDENTE;
  }

  liberar(): void {
    if (this.status !== StatusAutorizacao.PENDENTE) {
      throw new Error(`Não é possível liberar uma autorização com status "${this.status}"`);
    }
    this.status = StatusAutorizacao.LIBERADA;
  }

  concluir(): void {
    if (this.status !== StatusAutorizacao.LIBERADA) {
      throw new Error('Só é possível concluir uma autorização liberada');
    }
    this.status = StatusAutorizacao.CONCLUIDA;
  }

  cancelar(): void {
    if (this.status === StatusAutorizacao.CONCLUIDA) {
      throw new Error('Autorização já concluída não pode ser cancelada');
    }
    this.status = StatusAutorizacao.CANCELADA;
  }

  podeGerarAbastecimento(): boolean {
    return this.status === StatusAutorizacao.LIBERADA;
  }
}
