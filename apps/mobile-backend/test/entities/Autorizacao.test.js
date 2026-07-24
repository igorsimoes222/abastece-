import { describe, it, expect } from 'vitest';
const { Autorizacao } = require('../../src/entities/Autorizacao');
const { Money } = require('../../src/shared/Money');
const { StatusAutorizacao } = require('../../src/shared/Enums');

function novaAutorizacao() {
  return new Autorizacao({ id: 'au1', clienteId: 'c1', bicoId: 'b1', valor: Money.reais(100), data: new Date() });
}

describe('Autorizacao', () => {
  it('nasce pendente', () => {
    expect(novaAutorizacao().status).toBe(StatusAutorizacao.PENDENTE);
  });

  it('segue o ciclo pendente -> liberada -> concluida', () => {
    const au = novaAutorizacao();
    au.liberar();
    expect(au.status).toBe(StatusAutorizacao.LIBERADA);
    au.concluir();
    expect(au.status).toBe(StatusAutorizacao.CONCLUIDA);
  });

  it('não permite liberar uma autorização que não está pendente', () => {
    const au = novaAutorizacao();
    au.liberar();
    expect(() => au.liberar()).toThrow('Não é possível liberar');
  });

  it('não permite concluir uma autorização que não está liberada', () => {
    expect(() => novaAutorizacao().concluir()).toThrow('Só é possível concluir uma autorização liberada');
  });

  it('não permite cancelar uma autorização já concluída', () => {
    const au = novaAutorizacao();
    au.liberar();
    au.concluir();
    expect(() => au.cancelar()).toThrow('já concluída não pode ser cancelada');
  });

  it('podeGerarAbastecimento só é true quando liberada', () => {
    const au = novaAutorizacao();
    expect(au.podeGerarAbastecimento()).toBe(false);
    au.liberar();
    expect(au.podeGerarAbastecimento()).toBe(true);
  });
});
