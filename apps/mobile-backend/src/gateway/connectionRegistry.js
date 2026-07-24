/**
 * Registro de quais postos estão conectados agora.
 *
 * Hoje: em memória, funciona enquanto o gateway rodar num processo só —
 * suficiente pra escala atual (validado: ~1000 clientes/dezenas de postos
 * fica muito abaixo do que forçaria múltiplos processos). Se um dia escalar
 * pra mais de uma instância, troca-se esta implementação por uma baseada em
 * Redis (registro compartilhado + pub/sub pra rotear comando pro processo
 * certo) sem mudar quem usa este módulo (gateway.js só depende dos métodos
 * abaixo, não de como são guardados).
 */
class InMemoryConnectionRegistry {
  #conectados = new Map(); // codigoLocal -> { ws, postoId }

  registrar(codigoLocal, ws, postoId) {
    this.#conectados.set(codigoLocal, { ws, postoId });
  }

  remover(codigoLocal) {
    this.#conectados.delete(codigoLocal);
  }

  obter(codigoLocal) {
    return this.#conectados.get(codigoLocal);
  }

  estaOnline(codigoLocal) {
    return this.#conectados.has(codigoLocal);
  }
}

module.exports = { InMemoryConnectionRegistry };
