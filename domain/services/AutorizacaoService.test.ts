import { describe, it, expect } from 'vitest';
import { AutorizacaoService } from './AutorizacaoService';
import { Autorizacao } from '../entities/Autorizacao';
import { Money } from '../shared/Money';
import { StatusAutorizacao } from '../shared/Enums';

function novaAutorizacaoLiberada(valor = Money.reais(100)) {
  const au = new Autorizacao({ id: 'au1', clienteId: 'c1', bicoId: 'b1', valor, data: new Date() });
  au.liberar();
  return au;
}

describe('AutorizacaoService', () => {
  it('liberar delega para a entidade', () => {
    const service = new AutorizacaoService();
    const au = new Autorizacao({ id: 'au1', clienteId: 'c1', bicoId: 'b1', valor: Money.reais(100), data: new Date() });
    service.liberar(au);
    expect(au.status).toBe(StatusAutorizacao.LIBERADA);
  });

  it('iniciarAbastecimento cria o abastecimento e conclui a autorização', () => {
    const service = new AutorizacaoService();
    const au = novaAutorizacaoLiberada();
    const abast = service.iniciarAbastecimento({ id: 'a1', autorizacao: au, data: new Date(), litros: 10, valor: Money.reais(87.5), sequencial: 1 });

    expect(abast.autorizacaoId).toBe('au1');
    expect(abast.bicoId).toBe('b1');
    expect(au.status).toBe(StatusAutorizacao.CONCLUIDA);
  });

  it('rejeita iniciar abastecimento com autorização não liberada', () => {
    const service = new AutorizacaoService();
    const au = new Autorizacao({ id: 'au1', clienteId: 'c1', bicoId: 'b1', valor: Money.reais(100), data: new Date() });
    expect(() =>
      service.iniciarAbastecimento({ id: 'a1', autorizacao: au, data: new Date(), litros: 10, valor: Money.reais(87.5), sequencial: 1 })
    ).toThrow('precisa estar liberada');
  });

  it('rejeita abastecimento com valor maior que o autorizado', () => {
    const service = new AutorizacaoService();
    const au = novaAutorizacaoLiberada(Money.reais(50));
    expect(() =>
      service.iniciarAbastecimento({ id: 'a1', autorizacao: au, data: new Date(), litros: 10, valor: Money.reais(87.5), sequencial: 1 })
    ).toThrow('não pode ultrapassar o valor autorizado no bico');
  });
});
