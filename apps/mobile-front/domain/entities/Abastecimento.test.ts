import { describe, it, expect } from 'vitest';
import { Abastecimento } from './Abastecimento';
import { Pagamento } from './Pagamento';
import { Money } from '../shared/Money';
import { FormaPagamento } from '../shared/Enums';

function novoAbastecimento(valor = Money.reais(87.5)) {
  return new Abastecimento({ id: 'a1', autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 10, valor, sequencial: 1 });
}

describe('Abastecimento', () => {
  it('não está quitado sem pagamentos', () => {
    expect(novoAbastecimento().estaQuitado()).toBe(false);
  });

  it('aceita split de pagamentos que soma exatamente o valor', () => {
    const abast = novoAbastecimento();
    abast.adicionarPagamento(new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(50) }));
    abast.adicionarPagamento(new Pagamento({ id: 'p2', abastecimentoId: 'a1', forma: FormaPagamento.PIX, valor: Money.reais(37.5) }));
    expect(abast.estaQuitado()).toBe(true);
    expect(abast.saldoDevedor().ehZero()).toBe(true);
  });

  it('rejeita pagamento que faz a soma ultrapassar o valor do abastecimento', () => {
    const abast = novoAbastecimento(Money.reais(50));
    abast.adicionarPagamento(new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(40) }));
    expect(() =>
      abast.adicionarPagamento(new Pagamento({ id: 'p2', abastecimentoId: 'a1', forma: FormaPagamento.PIX, valor: Money.reais(20) }))
    ).toThrow('não pode ultrapassar');
  });

  it('calcula saldo devedor de um pagamento parcial', () => {
    const abast = novoAbastecimento(Money.reais(50));
    abast.adicionarPagamento(new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(30) }));
    expect(abast.saldoDevedor().valorEmCentavos).toBe(2000);
    expect(abast.estaQuitado()).toBe(false);
  });
});
