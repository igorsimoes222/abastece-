export interface CupomProps {
  id: string;
  pagamentoId: string;
  codigo: string;
}

export class Cupom {
  readonly id: string;
  readonly pagamentoId: string;
  readonly codigo: string;
  readonly emitidoEm: Date;

  constructor(props: CupomProps) {
    this.id = props.id;
    this.pagamentoId = props.pagamentoId;
    this.codigo = props.codigo;
    this.emitidoEm = new Date();
  }
}
