import { describe, it, expect } from 'vitest';
const { PagamentoAbastecimentoService } = require('../../src/services/PagamentoAbastecimentoService');
const { Abastecimento } = require('../../src/entities/Abastecimento');
const { Pagamento } = require('../../src/entities/Pagamento');
const { Carteira } = require('../../src/entities/Carteira');
const { Money } = require('../../src/shared/Money');
const { FormaPagamento } = require('../../src/shared/Enums');

function novoAbastecimento(valor = Money.reais(87.5), id = 'a1') {
  return new Abastecimento({ id, autorizacaoId: 'au1', bicoId: 'b1', data: new Date(), litros: 10, valor, sequencial: 1 });
}

describe('PagamentoAbastecimentoService', () => {
  it('confirmarPagamentoBancario aprova o pagamento e vincula ao abastecimento', () => {
    const service = new PagamentoAbastecimentoService();
    const abast = novoAbastecimento();
    const pgto = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(87.5) });

    service.confirmarPagamentoBancario(abast, pgto, 'txn_1');

    expect(pgto.idTransacaoBanco).toBe('txn_1');
    expect(abast.listaPagamentos).toHaveLength(1);
    expect(abast.estaQuitado()).toBe(true);
  });

  it('finalizar gera cupom e credita cashback quando quitado com cartão/pix', () => {
    const service = new PagamentoAbastecimentoService();
    const abast = novoAbastecimento();
    const pgto = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.PIX, valor: Money.reais(87.5) });
    service.confirmarPagamentoBancario(abast, pgto, 'txn_1');

    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    const resultado = service.finalizar({ abastecimento: abast, carteira, percentualCashback: 1, cupomId: 'cup1', cupomCodigo: 'ABC', devendoId: 'dev1' });

    expect(resultado.cupomGerado).toBeDefined();
    expect(resultado.cupomGerado?.pagamentoId).toBe('p1');
    expect(resultado.devendoGerado).toBeUndefined();
    expect(carteira.saldo.valorEmCentavos).toBe(88);
  });

  it('finalizar NÃO gera cupom nem cashback quando o pagamento final é em dinheiro', () => {
    const service = new PagamentoAbastecimentoService();
    const abast = novoAbastecimento(Money.reais(50));
    const pgto = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.DINHEIRO, valor: Money.reais(50) });
    service.confirmarPagamentoDireto(abast, pgto);

    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    const resultado = service.finalizar({ abastecimento: abast, carteira, percentualCashback: 1, cupomId: 'cup1', cupomCodigo: 'ABC', devendoId: 'dev1' });

    expect(resultado.cupomGerado).toBeUndefined();
    expect(resultado.devendoGerado).toBeUndefined();
    expect(carteira.saldo.ehZero()).toBe(true);
  });

  it('finalizar gera Devendo quando sobra saldo não pago', () => {
    const service = new PagamentoAbastecimentoService();
    const abast = novoAbastecimento(Money.reais(50));
    const pgto = new Pagamento({ id: 'p1', abastecimentoId: 'a1', forma: FormaPagamento.CREDITO, valor: Money.reais(30) });
    service.confirmarPagamentoBancario(abast, pgto, 'txn_1');

    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    const resultado = service.finalizar({ abastecimento: abast, carteira, percentualCashback: 1, cupomId: 'cup1', cupomCodigo: 'ABC', devendoId: 'dev1' });

    expect(resultado.devendoGerado).toBeDefined();
    expect(resultado.devendoGerado?.valorDevido.valorEmCentavos).toBe(2000);
    expect(resultado.cupomGerado).toBeUndefined();
  });

  it('finalizar lança erro se não houver nenhum pagamento registrado', () => {
    const service = new PagamentoAbastecimentoService();
    const abast = novoAbastecimento();
    const carteira = new Carteira({ id: 'w1', clienteId: 'c1' });
    expect(() =>
      service.finalizar({ abastecimento: abast, carteira, percentualCashback: 1, cupomId: 'cup1', cupomCodigo: 'ABC', devendoId: 'dev1' })
    ).toThrow('não tem nenhum pagamento registrado');
  });
});
