import { describe, it, expect } from 'vitest';
const { Veiculo } = require('../../src/entities/Veiculo');
const { Money } = require('../../src/shared/Money');

function novoVeiculo() {
  return new Veiculo({ id: 'v1', frotaId: 'f1', placa: 'abc1d23', modelo: 'Civic', tipoCombustivel: 'Gasolina', limiteMensal: Money.reais(500) });
}

describe('Veiculo', () => {
  it('normaliza a placa para maiúsculas', () => {
    expect(novoVeiculo().placa).toBe('ABC1D23');
  });

  it('acumula gasto dentro do limite mensal', () => {
    const v = novoVeiculo();
    v.registrarGasto(Money.reais(200));
    v.registrarGasto(Money.reais(200));
    expect(v.gastoAtualNoMes.valorEmCentavos).toBe(40000);
  });

  it('bloqueia gasto que ultrapassa o limite mensal', () => {
    const v = novoVeiculo();
    v.registrarGasto(Money.reais(450));
    expect(() => v.registrarGasto(Money.reais(100))).toThrow('excede o limite mensal');
  });

  it('resetarGastoMensal zera o acumulado', () => {
    const v = novoVeiculo();
    v.registrarGasto(Money.reais(450));
    v.resetarGastoMensal();
    expect(v.gastoAtualNoMes.ehZero()).toBe(true);
    expect(() => v.registrarGasto(Money.reais(450))).not.toThrow();
  });
});
