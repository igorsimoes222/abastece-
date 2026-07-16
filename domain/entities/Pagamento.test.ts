import { describe, it, expect } from 'vitest';
import { Pagamento } from './Pagamento';
import { Money } from '../shared/Money';
import { FormaPagamento, StatusPagamento } from '../shared/Enums';

describe('Pagamento', () => {
  it('nasce pendente', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(50) });
    expect(p.status).toBe(StatusPagamento.PENDENTE);
  });

  it('confirmarViaBanco aprova e guarda a referência da transação', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(50) });
    p.confirmarViaBanco('txn_123');
    expect(p.status).toBe(StatusPagamento.APROVADO);
    expect(p.idTransacaoBanco).toBe('txn_123');
    expect(p.dataPagamento).toBeInstanceOf(Date);
  });

  it('rejeita confirmarViaBanco para pagamento em dinheiro', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.DINHEIRO, valor: Money.reais(50) });
    expect(() => p.confirmarViaBanco('txn_123')).toThrow('não passa por transação bancária');
  });

  it('rejeita registrarPagamentoDireto para forma diferente de dinheiro', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.PIX, valor: Money.reais(50) });
    expect(() => p.registrarPagamentoDireto()).toThrow('exclusivo para pagamento direto no posto');
  });

  it('registrarPagamentoDireto aprova pagamento em dinheiro', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.DINHEIRO, valor: Money.reais(50) });
    p.registrarPagamentoDireto();
    expect(p.status).toBe(StatusPagamento.APROVADO);
  });

  it('recusar marca o pagamento como recusado', () => {
    const p = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(50) });
    p.recusar();
    expect(p.status).toBe(StatusPagamento.RECUSADO);
  });
});
