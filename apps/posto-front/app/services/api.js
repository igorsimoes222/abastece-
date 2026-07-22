import { API_URL, API_TIMEOUT } from '../config/env';

// ---------------------------------------------------------------------------
// DADOS DEMO — substitua por request() real quando o backend tiver os endpoints
// ---------------------------------------------------------------------------
const DEMO = __DEV__;

const MOCK_BOMBAS = [
  {
    id: 1, nome: 'Bomba 1',
    bicos: [
      { id: 101, numero: '01', combustivel: 'Gasolina Comum',   status: 'livre' },
      { id: 102, numero: '03', combustivel: 'Gasolina Aditivada', status: 'livre' },
      { id: 103, numero: '05', combustivel: 'Diesel S-10',       status: 'livre' },
      { id: 104, numero: '07', combustivel: 'Diesel S-10',       status: 'livre' },
    ],
  },
  {
    id: 2, nome: 'Bomba 2',
    bicos: [
      { id: 201, numero: '07', combustivel: 'Gasolina Comum',    status: 'livre' },
      { id: 202, numero: '09', combustivel: 'Gasolina Comum',    status: 'pendente', cliente: 'Marcos Silva', placa: 'HKQ-1234' },
      { id: 203, numero: '11', combustivel: 'Gas. Aditivada',    status: 'livre' },
      { id: 204, numero: '13', combustivel: 'Diesel S-10',       status: 'livre' },
    ],
  },
  {
    id: 3, nome: 'Bomba 3',
    bicos: [
      { id: 301, numero: '03', combustivel: 'Gasolina Comum',    status: 'abastecendo', cliente: 'Ana Luiza', placa: 'SJC-5678' },
      { id: 302, numero: '05', combustivel: 'Diesel S-10',       status: 'livre' },
    ],
  },
  {
    id: 4, nome: 'Bomba 4',
    bicos: [
      { id: 401, numero: '15', combustivel: 'Gasolina Comum',    status: 'livre' },
      { id: 402, numero: '17', combustivel: 'Gas. Aditivada',    status: 'livre' },
      { id: 403, numero: '19', combustivel: 'Diesel S-10',       status: 'livre' },
      { id: 404, numero: '21', combustivel: 'Diesel S-10',       status: 'livre' },
    ],
  },
];

const MOCK_SOLICITACAO = {
  id: 'demo-001',
  cliente_nome: 'Marcos Silva',
  placa: 'HKQ-1234',
  modelo: 'Onix',
  metodo_pagamento: 'Crédito Visa ···4521',
  valor: '100.00',
};

let mockLitros = 0;
let mockValor  = 0;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------

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

export async function getBombas() {
  if (DEMO) { await delay(400); return { bombas: MOCK_BOMBAS }; }
  return request('/frentista/bombas');
}

export async function getSolicitacoes(bicoId) {
  if (DEMO) {
    await delay(300);
    const temPendente = bicoId === 202;
    return { solicitacao: temPendente ? MOCK_SOLICITACAO : null };
  }
  return request(`/frentista/bico/${bicoId}/solicitacoes`);
}

export async function aprovarSolicitacao(solicitacaoId) {
  if (DEMO) { await delay(600); mockLitros = 0; mockValor = 0; return { ok: true }; }
  return request(`/frentista/solicitacao/${solicitacaoId}/aprovar`, { method: 'POST' });
}

export async function recusarSolicitacao(solicitacaoId, motivo = '') {
  if (DEMO) { await delay(400); return { ok: true }; }
  return request(`/frentista/solicitacao/${solicitacaoId}/recusar`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

export async function getStatusBomba(bicoId) {
  if (DEMO) {
    await delay(200);
    mockLitros += 0.08 + Math.random() * 0.04;
    mockValor  += 0.45 + Math.random() * 0.30;
    return { status: 'abastecendo', litros: mockLitros, valor_atual: mockValor };
  }
  return request(`/frentista/bico/${bicoId}/status`);
}

export async function confirmarConclusao(abastecimentoId) {
  if (DEMO) {
    await delay(600);
    return { resumo: { litros: mockLitros, valor_real: mockValor } };
  }
  return request(`/frentista/abastecimento/${abastecimentoId}/concluir`, { method: 'POST' });
}
