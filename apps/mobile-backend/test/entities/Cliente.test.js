import { describe, it, expect } from 'vitest';
const { Cliente } = require('../../src/entities/Cliente');

const props = {
  id: 'c1',
  nome: 'Lucas',
  email: 'lucas@email.com',
  telefone: '12999990000',
  dataNascimento: new Date('1990-01-01'),
};

describe('Cliente', () => {
  it('aceita CPF válido em diferentes formatos', () => {
    expect(() => new Cliente({ ...props, cpf: '123.456.789-00' })).not.toThrow();
    expect(() => new Cliente({ ...props, cpf: '12345678900' })).not.toThrow();
  });

  it('rejeita CPF com formato inválido', () => {
    expect(() => new Cliente({ ...props, cpf: '123' })).toThrow('CPF inválido');
  });

  it('considera maior de idade quando o aniversário já passou este ano', () => {
    const cliente = new Cliente({ ...props, cpf: '12345678900', dataNascimento: new Date('2000-01-01') });
    expect(cliente.ehMaiorDeIdade(new Date('2026-02-01'))).toBe(true);
  });

  it('considera menor de idade quando o aniversário de 18 anos ainda não chegou', () => {
    const cliente = new Cliente({ ...props, cpf: '12345678900', dataNascimento: new Date('2008-12-31') });
    expect(cliente.ehMaiorDeIdade(new Date('2026-07-16'))).toBe(false);
  });
});
