import { Money } from '../shared/Money';

// Junção Posto <-> Produto: o mesmo combustível tem preço diferente em cada
// posto (ex.: Gasolina Comum a R$ 5,89 em SJC e R$ 5,79 em Taubaté).
export interface PostoProdutoProps {
  id: string;
  postoId: string;
  produtoId: string;
  preco: Money;
}

export class PostoProduto {
  readonly id: string;
  readonly postoId: string;
  readonly produtoId: string;
  preco: Money;

  constructor(props: PostoProdutoProps) {
    if (!props.preco.maiorQue(Money.zero())) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    this.id = props.id;
    this.postoId = props.postoId;
    this.produtoId = props.produtoId;
    this.preco = props.preco;
  }

  atualizarPreco(novoPreco: Money): void {
    if (!novoPreco.maiorQue(Money.zero())) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    this.preco = novoPreco;
  }
}
