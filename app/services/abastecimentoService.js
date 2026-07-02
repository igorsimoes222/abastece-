import { api } from './api';

// ─── Mock ────────────────────────────────────────────────────────────────────
const USE_MOCK = false;
// ─────────────────────────────────────────────────────────────────────────────

export const abastecimentoService = {
  // Inicia o ciclo: libera o bico na HORUSTECH
  async iniciar({ bico, valor }) {
    if (USE_MOCK) {
      return { cicloId: `ciclo_${Date.now()}`, status: 'aguardando_abastecimento' };
    }
    const data = await api.post('/autorizar', { bico, valor });
    return { cicloId: data.cicloId, status: data.ok ? 'aguardando_abastecimento' : 'erro' };
  },

  // Polling: consulta valor em tempo real (AbastecendoScreen)
  async consultarProgresso(numeroBico) {
    if (USE_MOCK) {
      return { status: 'abastecendo', valorAtual: '45,30', litros: '7,69' };
    }
    const data = await api.get('/visualizacao');
    const bicos = data.abastecendo || [];
    if (bicos.length === 0) return { status: 'aguardando', valorAtual: '0,00' };
    // Filtra pelo bico autorizado; se não encontrar, considera aguardando
    const bicoNorm = String(numeroBico ?? '').padStart(2, '0');
    const b = numeroBico ? bicos.find(x => String(x.bico).padStart(2, '0') === bicoNorm) : bicos[0];
    if (!b) return { status: 'aguardando', valorAtual: '0,00' };
    return { status: 'abastecendo', valorAtual: b.valor, bico: b.bico };
  },

  // Lê o abastecimento finalizado na HORUSTECH filtrando pelo bico
  // O backend já faz (&I) automaticamente após encontrar o registro certo
  async confirmarValor(numeroBico) {
    if (USE_MOCK) {
      return { valorConfirmado: '87,50', status: 'aguardando_pagamento' };
    }
    const bicoParam = numeroBico ? `?bico=${numeroBico}` : '';
    const data = await api.get(`/abastecimento${bicoParam}`);
    if (data.vazio) return { valorConfirmado: null, status: 'sem_dados' };
    return {
      valorConfirmado: data.valor,
      volume: data.volume,
      preco: data.preco,
      bico: data.bico,
      status: 'aguardando_pagamento',
    };
  },

  // Solicita cancelamento
  async cancelar() {
    return { status: 'cancelado' };
  },

  // Histórico do usuário
  async historico({ pagina = 1, limite = 20 } = {}) {
    if (USE_MOCK) {
      return {
        total: 7,
        pagina,
        itens: [
          { id: 'a1', data: '28/06/2025', posto: 'Sete Estrelas', valor: '87,50', cashback: '0,88', metodo: 'Nubank crédito' },
          { id: 'a2', data: '21/06/2025', posto: 'Sete Estrelas', valor: '65,00', cashback: '0,65', metodo: 'Itaú débito' },
        ],
      };
    }

    return api.get(`/abastecimentos/historico?pagina=${pagina}&limite=${limite}`);
  },
};
