import { api } from './api';

// ─── Mock ────────────────────────────────────────────────────────────────────
const USE_MOCK = false;

const MOCK_POSTOS = [
  { id: 'sete_001', nome: 'Sete Estrelas', cidade: 'São José dos Campos', uf: 'SP', endereco: 'Av. Perseu, 752', bairro: 'Jardim Satélite', lat: -23.2274965, lng: -45.8905572, preco: '5,89', cashback: '1', bicos: ['01','02','03','04','05','06'] },
  { id: 'sete_002', nome: 'Sete Estrelas', cidade: 'Taubaté', uf: 'SP', endereco: 'Av. Dr. Félix Guisard Filho, 355', bairro: 'Belém', lat: -23.0421835, lng: -45.5576301, preco: '5,79', cashback: '1', bicos: ['01','02','03','04'] },
];

const MOCK_COMBUSTIVEIS = [
  { tipo: 'Gasolina Comum',     icone: '🔴', preco: 'R$ 5,89' },
  { tipo: 'Gasolina Aditivada', icone: '🟡', preco: 'R$ 6,19' },
  { tipo: 'Etanol',             icone: '🟢', preco: 'R$ 3,99' },
  { tipo: 'Diesel S-10',        icone: '🔵', preco: 'R$ 6,49' },
];
// ─────────────────────────────────────────────────────────────────────────────

export const postosService = {
  async listar(lat, lng) {
    if (USE_MOCK) return MOCK_POSTOS;

    // API retorna postos ordenados por distância quando lat/lng informados
    const query = lat ? `?lat=${lat}&lng=${lng}` : '';
    return api.get(`/postos${query}`);
  },

  async buscarPorId(id) {
    if (USE_MOCK) return MOCK_POSTOS.find(p => p.id === id) ?? MOCK_POSTOS[0];
    return api.get(`/postos/${id}`);
  },

  async combustiveisDoPosto(postoId) {
    if (USE_MOCK) return MOCK_COMBUSTIVEIS;
    return api.get(`/postos/${postoId}/combustiveis`);
  },

  async bicosDisponiveis() {
    if (USE_MOCK) {
      return ['02', '03', '05', '07'].map(num => ({ numero: num, disponivel: true }))
        .concat(['01', '04', '06', '08'].map(num => ({ numero: num, disponivel: false })));
    }
    // Busca status real da HORUSTECH via backend
    const data = await api.get('/status');
    return (data.bicos || []).map(b => ({
      numero: b.numero,
      disponivel: b.estado === 'L' || b.estado === 'P',
      estado: b.estado,
      label: b.label,
    }));
  },
};
