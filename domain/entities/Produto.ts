export interface ProdutoProps {
  id: string;
  descricao: string;
  codigo: string;
}

export class Produto {
  readonly id: string;
  descricao: string;
  codigo: string;

  constructor(props: ProdutoProps) {
    this.id = props.id;
    this.descricao = props.descricao;
    this.codigo = props.codigo;
  }
}
