import { Money } from '../shared/Money';
import { StatusDevendo } from '../shared/Enums';

export interface DevendoProps {
  id: string;
  pagamentoId: string;
  valorDevido: Money;
}

export class Devendo {
  readonly id: string;
  readonly pagamentoId: string;
  readonly valorDevido: Money;
  readonly dataOcorrencia: Date;
  status: StatusDevendo;

  constructor(props: DevendoProps) {
    this.id = props.id;
    this.pagamentoId = props.pagamentoId;
    this.valorDevido = props.valorDevido;
    this.dataOcorrencia = new Date();
    this.status = StatusDevendo.PENDENTE;
  }

  quitar(): void {
    this.status = StatusDevendo.QUITADO;
  }
}
