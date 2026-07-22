import { api } from './api';

// ─── Mock ────────────────────────────────────────────────────────────────────
const USE_MOCK = true;
// ─────────────────────────────────────────────────────────────────────────────

export const pagamentoService = {
  // Processa o pagamento via split (Cielo/Getnet divide automaticamente)
  async pagar({ cicloId, metodo, valor }) {
    if (USE_MOCK) {
      return {
        transacaoId: `txn_${Date.now()}`,
        status: 'aprovado',
        valor,
        metodo,
        cashback: (parseFloat(valor.replace(',', '.')) * 0.01).toFixed(2).replace('.', ','),
        dataPagamento: new Date().toLocaleDateString('pt-BR'),
      };
    }

    // metodo: 'credito' | 'debito' | 'pix'
    return api.post('/pagamentos/processar', { cicloId, metodo, valor });
  },

  // Registra pagamento direto no posto (dinheiro) — sem split, comissão vai no boleto do posto
  async registrarPagamentoDireto({ cicloId, valor }) {
    if (USE_MOCK) {
      return { status: 'registrado', cicloId, valor };
    }

    return api.post('/pagamentos/direto', { cicloId, valor });
  },

  // Lista cartões salvos do usuário
  async listarCartoes() {
    if (USE_MOCK) {
      return [
        { id: 'c1', bandeira: 'Visa',       banco: 'Nubank', final: '4521', tipo: 'credito', padrao: true  },
        { id: 'c2', bandeira: 'Mastercard', banco: 'Itaú',   final: '9834', tipo: 'debito',  padrao: false },
      ];
    }

    return api.get('/pagamentos/cartoes');
  },

  // Pré-autorização — bloqueia limite no cartão de crédito, vinculada ao posto
  async criarPreAutorizacao({ postoId, cartaoId, valor }) {
    if (USE_MOCK) {
      return {
        preAuthId: `pa_${Date.now()}`,
        status: 'ativa',
        postoId,
        valor,
        validade: '48h',
        criadaEm: new Date().toLocaleDateString('pt-BR'),
      };
    }

    return api.post('/pagamentos/pre-autorizacao', { postoId, cartaoId, valor });
  },

  // Lista pré-autorizações ativas do usuário
  async listarPreAutorizacoes() {
    if (USE_MOCK) {
      return [
        { preAuthId: 'pa_001', posto: 'Sete Estrelas — Jacareí', valor: '200,00', validade: '48h', criadaEm: '28/06/2025', status: 'ativa' },
      ];
    }

    return api.get('/pagamentos/pre-autorizacao');
  },

  // Solicita cancelamento da pré-autorização (só o posto confirma)
  async cancelarPreAutorizacao(preAuthId) {
    if (USE_MOCK) {
      return { preAuthId, status: 'cancelamento_solicitado' };
    }

    return api.patch(`/pagamentos/pre-autorizacao/${preAuthId}/cancelar`);
  },
};
