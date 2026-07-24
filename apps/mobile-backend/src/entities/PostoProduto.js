const { Money } = require('../shared/Money');

// Junção Posto <-> Produto: o mesmo combustível tem preço diferente em cada
// posto (ex.: Gasolina Comum a R$ 5,89 em SJC e R$ 5,79 em Taubaté).
class PostoProduto {
  constructor(props) {
    if (!props.preco.maiorQue(Money.zero())) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    this.id = props.id;
    this.postoId = props.postoId;
    this.produtoId = props.produtoId;
    this.preco = props.preco;
  }

  atualizarPreco(novoPreco) {
    if (!novoPreco.maiorQue(Money.zero())) {
      throw new Error('Preço do combustível deve ser maior que zero');
    }
    this.preco = novoPreco;
  }
}

module.exports = { PostoProduto };
