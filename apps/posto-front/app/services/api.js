import { API_URL, API_TIMEOUT } from '../config/env';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timer);
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Busca todas as bombas e bicos do posto com status atual
export function getBombas() {
  return request('/frentista/bombas');
}

// Busca solicitações pendentes de um bico específico
export function getSolicitacoes(bicoId) {
  return request(`/frentista/bico/${bicoId}/solicitacoes`);
}

// Aprova solicitação → dispara preset na bomba via CBC
export function aprovarSolicitacao(solicitacaoId) {
  return request(`/frentista/solicitacao/${solicitacaoId}/aprovar`, { method: 'POST' });
}

// Recusa solicitação → notifica cliente
export function recusarSolicitacao(solicitacaoId, motivo = '') {
  return request(`/frentista/solicitacao/${solicitacaoId}/recusar`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

// Status ao vivo de uma bomba durante abastecimento (polling)
export function getStatusBomba(bicoId) {
  return request(`/frentista/bico/${bicoId}/status`);
}

// Confirma conclusão manualmente (fallback caso CBC não detecte)
export function confirmarConclusao(abastecimentoId) {
  return request(`/frentista/abastecimento/${abastecimentoId}/concluir`, { method: 'POST' });
}
