import { api } from './api';

// ─── Mock ────────────────────────────────────────────────────────────────────
const USE_MOCK = false;
// ─────────────────────────────────────────────────────────────────────────────

export const carteiraService = {
  async resumo() {
    if (USE_MOCK) {
      return {
        cashbackAcumulado: '14,63',
        totalAbastecimentos: 7,
        totalGasto: '413,00',
        percentualCashback: '1',
      };
    }

    return api.get('/carteira/resumo');
  },

  async extrato({ filtro = 'todos', pagina = 1 } = {}) {
    if (USE_MOCK) {
      return [
        { id: 'e1', tipo: 'abastecimento', data: '28/06/2025', desc: 'Sete Estrelas — Jacareí',    valor: '-R$ 87,50',  cashback: '+R$ 0,88' },
        { id: 'e2', tipo: 'cashback',      data: '28/06/2025', desc: 'Cashback abastecimento',      valor: '+R$ 0,88',   cashback: null       },
        { id: 'e3', tipo: 'abastecimento', data: '21/06/2025', desc: 'Sete Estrelas — Taubaté',     valor: '-R$ 65,00',  cashback: '+R$ 0,65' },
        { id: 'e4', tipo: 'cashback',      data: '21/06/2025', desc: 'Cashback abastecimento',      valor: '+R$ 0,65',   cashback: null       },
        { id: 'e5', tipo: 'abastecimento', data: '14/06/2025', desc: 'Sete Estrelas — SJC',         valor: '-R$ 100,00', cashback: '+R$ 1,00' },
      ];
    }

    return api.get(`/carteira/extrato?filtro=${filtro}&pagina=${pagina}`);
  },
};
