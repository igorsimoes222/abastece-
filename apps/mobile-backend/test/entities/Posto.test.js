import { describe, it, expect } from 'vitest';
const { Posto } = require('../../src/entities/Posto');

describe('Posto', () => {
  it('calcula distância zero para o mesmo ponto', () => {
    const posto = new Posto({
      id: 'p1', nome: 'Sete Estrelas', codigo: '001', cep: '12200-000',
      rua: 'Av. Perseu', numero: '752', bairro: 'Jardim Satélite', cidade: 'São José dos Campos', estado: 'SP',
      latitude: -23.2274965, longitude: -45.8905572,
    });
    expect(posto.distanciaKm(-23.2274965, -45.8905572)).toBeCloseTo(0, 5);
  });

  it('calcula distância aproximada entre dois postos reais (SJC -> Taubaté)', () => {
    const posto = new Posto({
      id: 'p1', nome: 'Sete Estrelas', codigo: '001', cep: '12200-000',
      rua: 'Av. Perseu', numero: '752', bairro: 'Jardim Satélite', cidade: 'São José dos Campos', estado: 'SP',
      latitude: -23.2274965, longitude: -45.8905572,
    });
    const distancia = posto.distanciaKm(-23.0421835, -45.5576301);
    expect(distancia).toBeGreaterThan(30);
    expect(distancia).toBeLessThan(50);
  });
});
