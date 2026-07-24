/**
 * Rate limiting simples em memória, por IP — sem dependência nova.
 * Suficiente pra proteger login/cadastro nesse tamanho de operação; se um dia
 * rodar em múltiplos processos, precisa virar contador compartilhado (Redis).
 */

const JANELA_MS = 5 * 60 * 1000; // 5 minutos
const LIMITE = 10; // tentativas por janela

const tentativas = new Map(); // ip -> [timestamps]

function limparAntigas(lista, agora) {
  return lista.filter((t) => agora - t < JANELA_MS);
}

function excedeuLimite(ip) {
  const agora = Date.now();
  const lista = limparAntigas(tentativas.get(ip) || [], agora);
  tentativas.set(ip, lista);
  return lista.length >= LIMITE;
}

function registrarTentativa(ip) {
  const agora = Date.now();
  const lista = limparAntigas(tentativas.get(ip) || [], agora);
  lista.push(agora);
  tentativas.set(ip, lista);
}

module.exports = { excedeuLimite, registrarTentativa };
