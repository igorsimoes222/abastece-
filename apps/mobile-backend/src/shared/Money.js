class Money {
  #centavos;

  constructor(centavos) {
    if (!Number.isInteger(centavos)) {
      throw new Error('Money deve ser representado em centavos (inteiro)');
    }
    this.#centavos = centavos;
  }

  static centavos(valor) {
    return new Money(valor);
  }

  static reais(valor) {
    return new Money(Math.round(valor * 100));
  }

  static zero() {
    return new Money(0);
  }

  get valorEmCentavos() {
    return this.#centavos;
  }

  somar(outro) {
    return new Money(this.#centavos + outro.valorEmCentavos);
  }

  subtrair(outro) {
    return new Money(this.#centavos - outro.valorEmCentavos);
  }

  multiplicarPor(fator) {
    return new Money(Math.round(this.#centavos * fator));
  }

  percentual(pct) {
    return new Money(Math.round(this.#centavos * (pct / 100)));
  }

  maiorQue(outro) {
    return this.#centavos > outro.valorEmCentavos;
  }

  maiorOuIgualA(outro) {
    return this.#centavos >= outro.valorEmCentavos;
  }

  menorQue(outro) {
    return this.#centavos < outro.valorEmCentavos;
  }

  ehZero() {
    return this.#centavos === 0;
  }

  formatado() {
    return (this.#centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

module.exports = { Money };
