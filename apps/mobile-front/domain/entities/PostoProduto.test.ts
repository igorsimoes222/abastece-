import { describe, it, expect } from 'vitest';
import { PostoProduto } from './PostoProduto';
import { Money } from '../shared/Money';

describe('PostoProduto', () => {
  it('permite preço maior que zero', () => {
    const pp = new PostoProduto({ id: 'pp1', postoId: 'posto1', produtoId: 'prod1', preco: Money.reais(5.89) });
    expect(pp.preco.valorEmCentavos).toBe(589);
  });

  it('rejeita preço zero na criação', () => {
    expect(() => new PostoProduto({ id: 'pp1', postoId: 'posto1', produtoId: 'prod1', preco: Money.zero() }))
      .toThrow('Preço do combustível deve ser maior que zero');
  });

  it('rejeita atualizar para preço zero', () => {
    const pp = new PostoProduto({ id: 'pp1', postoId: 'posto1', produtoId: 'prod1', preco: Money.reais(5.89) });
    expect(() => pp.atualizarPreco(Money.zero())).toThrow('Preço do combustível deve ser maior que zero');
  });

  it('permite atualizar para um novo preço válido', () => {
    const pp = new PostoProduto({ id: 'pp1', postoId: 'posto1', produtoId: 'prod1', preco: Money.reais(5.89) });
    pp.atualizarPreco(Money.reais(6.19));
    expect(pp.preco.valorEmCentavos).toBe(619);
  });
});
