import { describe, it, expect } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
  it('converte reais para centavos', () => {
    expect(Money.reais(87.5).valorEmCentavos).toBe(8750);
  });

  it('soma e subtrai preservando centavos', () => {
    const total = Money.reais(50).somar(Money.reais(37.5));
    expect(total.valorEmCentavos).toBe(8750);
    expect(total.subtrair(Money.reais(0.5)).valorEmCentavos).toBe(8700);
  });

  it('calcula percentual arredondando pro centavo mais próximo', () => {
    const cashback = Money.reais(87.5).percentual(1);
    expect(cashback.valorEmCentavos).toBe(88); // 0,875 -> arredonda pra 0,88
  });

  it('compara valores corretamente', () => {
    expect(Money.reais(10).maiorQue(Money.reais(9.99))).toBe(true);
    expect(Money.reais(10).maiorOuIgualA(Money.reais(10))).toBe(true);
    expect(Money.reais(9).menorQue(Money.reais(10))).toBe(true);
    expect(Money.zero().ehZero()).toBe(true);
  });

  it('formata em BRL', () => {
    expect(Money.reais(1234.5).formatado()).toBe('R$\xa01.234,50');
  });

  it('rejeita valor não-inteiro de centavos', () => {
    expect(() => Money.centavos(10.5)).toThrow();
  });
});
