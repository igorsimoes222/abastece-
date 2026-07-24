import { describe, it, expect } from 'vitest';
const { Frota } = require('../../src/entities/Frota');

describe('Frota', () => {
  it('aceita CNPJ válido em diferentes formatos', () => {
    expect(() => new Frota({ id: 'f1', cnpj: '12.345.678/0001-99', razaoSocial: 'Transportes LTDA', clienteResponsavelId: 'c1' })).not.toThrow();
    expect(() => new Frota({ id: 'f1', cnpj: '12345678000199', razaoSocial: 'Transportes LTDA', clienteResponsavelId: 'c1' })).not.toThrow();
  });

  it('rejeita CNPJ com formato inválido', () => {
    expect(() => new Frota({ id: 'f1', cnpj: '123', razaoSocial: 'Transportes LTDA', clienteResponsavelId: 'c1' })).toThrow('CNPJ inválido');
  });
});
