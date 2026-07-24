import { describe, it, expect } from 'vitest';
const { PreAutorizacaoPagamento } = require('../../src/entities/PreAutorizacaoPagamento');
const { Money } = require('../../src/shared/Money');
const { StatusPreAutorizacao } = require('../../src/shared/Enums');

function novaPreAuth(validadeHoras) {
  return new PreAutorizacaoPagamento({ id: 'pa1', clienteId: 'c1', postoId: 'posto1', valorSolicitado: Money.reais(200), validadeHoras });
}

describe('PreAutorizacaoPagamento', () => {
  it('nasce pendente com validade padrão de 48h', () => {
    const pa = novaPreAuth();
    expect(pa.status).toBe(StatusPreAutorizacao.PENDENTE);
    expect(pa.validadeHoras).toBe(48);
  });

  it('confirmarNoBanco ativa e guarda a referência da transação', () => {
    const pa = novaPreAuth();
    pa.confirmarNoBanco('txn_1');
    expect(pa.status).toBe(StatusPreAutorizacao.ATIVA);
    expect(pa.idTransacaoBanco).toBe('txn_1');
  });

  it('estaExpirada detecta quando passou da validade', () => {
    const pa = novaPreAuth(1);
    const duasHorasDepois = new Date(pa.criadaEm.getTime() + 2 * 60 * 60 * 1000);
    expect(pa.estaExpirada(duasHorasDepois)).toBe(true);
    expect(pa.estaExpirada(pa.criadaEm)).toBe(false);
  });

  it('solicitarCancelamento só funciona em pré-autorização ativa', () => {
    const pa = novaPreAuth();
    expect(() => pa.solicitarCancelamento()).toThrow('Só é possível solicitar cancelamento de uma pré-autorização ativa');
    pa.confirmarNoBanco('txn_1');
    pa.solicitarCancelamento();
    expect(pa.status).toBe(StatusPreAutorizacao.CANCELAMENTO_SOLICITADO);
  });

  it('confirmarCancelamentoPeloPosto exige solicitação pendente', () => {
    const pa = novaPreAuth();
    expect(() => pa.confirmarCancelamentoPeloPosto()).toThrow('Não há cancelamento pendente');
  });

  it('usarEmAbastecimento exige status ativa e respeita o teto solicitado', () => {
    const pa = novaPreAuth();
    expect(() => pa.usarEmAbastecimento(Money.reais(50))).toThrow('precisa estar ativa');

    pa.confirmarNoBanco('txn_1');
    expect(() => pa.usarEmAbastecimento(Money.reais(250))).toThrow('não pode ultrapassar o valor pré-autorizado');

    pa.usarEmAbastecimento(Money.reais(150));
    expect(pa.status).toBe(StatusPreAutorizacao.UTILIZADA);
    expect(pa.valorConfirmado?.valorEmCentavos).toBe(15000);
  });
});
