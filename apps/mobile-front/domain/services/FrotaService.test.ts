import { describe, it, expect } from 'vitest';
import { FrotaService } from './FrotaService';
import { Veiculo } from '../entities/Veiculo';
import { Abastecimento } from '../entities/Abastecimento';
import { Money } from '../shared/Money';

function novoVeiculo(limiteMensal = Money.reais(500)) {
  return new Veiculo({ id: 'v1', frotaId: 'f1', placa: 'ABC1D23', modelo: 'Civic', tipoCombustivel: 'Gasolina', limiteMensal });
}

function novoAbastecimento(valor: Money) {
  return new Abastecimento({ id: 'a1', autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 10, valor, sequencial: 1 });
}

describe('FrotaService', () => {
  it('registra o gasto do abastecimento no veículo', () => {
    const service = new FrotaService();
    const veiculo = novoVeiculo();
    service.registrarAbastecimentoNoVeiculo(veiculo, novoAbastecimento(Money.reais(200)));
    expect(veiculo.gastoAtualNoMes.valorEmCentavos).toBe(20000);
  });

  it('bloqueia quando o abastecimento estoura o limite mensal do veículo', () => {
    const service = new FrotaService();
    const veiculo = novoVeiculo(Money.reais(100));
    expect(() => service.registrarAbastecimentoNoVeiculo(veiculo, novoAbastecimento(Money.reais(150))))
      .toThrow('excede o limite mensal');
  });
});
