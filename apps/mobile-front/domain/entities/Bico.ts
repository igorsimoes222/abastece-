// Não guarda "disponível/estado" aqui — esse dado é lido ao vivo da HORUSTECH
// (GET /status) e nunca é persistido, senão fica desatualizado no banco.
export interface BicoProps {
  id: string;
  postoId: string;
  produtoId: string;
  numero: string;
}

export class Bico {
  readonly id: string;
  readonly postoId: string;
  produtoId: string;
  numero: string;

  constructor(props: BicoProps) {
    this.id = props.id;
    this.postoId = props.postoId;
    this.produtoId = props.produtoId;
    this.numero = props.numero.padStart(2, '0');
  }
}
