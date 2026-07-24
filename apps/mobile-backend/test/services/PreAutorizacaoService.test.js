import { describe, it, expect } from 'vitest';
const { PreAutorizacaoService } = require('../../src/services/PreAutorizacaoService');
const { PreAutorizacaoPagamento } = require('../../src/entities/PreAutorizacaoPagamento');
const { Abastecimento } = require('../../src/entities/Abastecimento');
const { Money } = require('../../src/shared/Money');
const { StatusPreAutorizacao, StatusPagamento, FormaPagamento } = require('../../src/shared/Enums');

function novaPreAuthAtiva() {
  const pa = new PreAutorizacaoPagamento({ id: 'pa1', clienteId: 'c1', postoId: 'posto1', valorSolicitado: Money.reais(200) });
  pa.confirmarNoBanco('txn_banco_1');
  return pa;
}

describe('PreAutorizacaoService', () => {
  it('confirma o abastecimento reaproveitando a transação bancária da pré-autorização', () => {
    const service = new PreAutorizacaoService();
    const preAuth = novaPreAuthAtiva();
    const abast = new Abastecimento({ id: 'a1', autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 12, valor: Money.reais(150), sequencial: 1 });

    const pagamento = service.confirmarAbastecimento({ preAutorizacao: preAuth, abastecimento: abast, pagamentoId: 'p1' });

    expect(pagamento.forma).toBe(FormaPagamento.CREDITO);
    expect(pagamento.status).toBe(StatusPagamento.APROVADO);
    expect(pagamento.idTransacaoBanco).toBe('txn_banco_1');
    expect(preAuth.status).toBe(StatusPreAutorizacao.UTILIZADA);
    expect(abast.estaQuitado()).toBe(true);
  });

  it('rejeita confirmar abastecimento com valor acima do pré-autorizado', () => {
    const service = new PreAutorizacaoService();
    const preAuth = novaPreAuthAtiva();
    const abast = new Abastecimento({ id: 'a1', autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 30, valor: Money.reais(250), sequencial: 1 });

    expect(() => service.confirmarAbastecimento({ preAutorizacao: preAuth, abastecimento: abast, pagamentoId: 'p1' }))
      .toThrow('não pode ultrapassar o valor pré-autorizado');
  });

  it('rejeita confirmar abastecimento com pré-autorização ainda não ativa', () => {
    const service = new PreAutorizacaoService();
    const preAuth = new PreAutorizacaoPagamento({ id: 'pa1', clienteId: 'c1', postoId: 'posto1', valorSolicitado: Money.reais(200) });
    const abast = new Abastecimento({ id: 'a1', autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 10, valor: Money.reais(100), sequencial: 1 });

    expect(() => service.confirmarAbastecimento({ preAutorizacao: preAuth, abastecimento: abast, pagamentoId: 'p1' }))
      .toThrow('precisa estar ativa');
  });
});
