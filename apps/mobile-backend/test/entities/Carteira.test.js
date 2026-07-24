import { describe, it, expect } from 'vitest';
const { Carteira } = require('../../src/entities/Carteira');
const { Money } = require('../../src/shared/Money');
const { TipoLancamentoCarteira } = require('../../src/shared/Enums');

describe('Carteira', () => {
  it('registra abastecimento gerando lançamento de débito e crédito de cashback', () => {
    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    carteira.registrarAbastecimento(Money.reais(87.5), 1, 'a1');

    expect(carteira.saldo.valorEmCentavos).toBe(88); // 1% de 8750 arredondado
    expect(carteira.gastoAcumulado.valorEmCentavos).toBe(8750);
    expect(carteira.quantidadeAbastecimentos).toBe(1);
    expect(carteira.lancamentos).toHaveLength(2);
    expect(carteira.lancamentos[0].tipo).toBe(TipoLancamentoCarteira.ABASTECIMENTO);
    expect(carteira.lancamentos[0].valor.valorEmCentavos).toBe(-8750);
    expect(carteira.lancamentos[1].tipo).toBe(TipoLancamentoCarteira.CASHBACK);
  });

  it('acumula saldo e contagem em múltiplos abastecimentos', () => {
    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    carteira.registrarAbastecimento(Money.reais(87.5), 1, 'a1');
    carteira.registrarAbastecimento(Money.reais(65), 1, 'a2');

    expect(carteira.quantidadeAbastecimentos).toBe(2);
    expect(carteira.gastoAcumulado.valorEmCentavos).toBe(15250);
    expect(carteira.lancamentos).toHaveLength(4);
  });
});
