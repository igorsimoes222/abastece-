export class Money {
  private constructor(private readonly centavos: number) {
    if (!Number.isInteger(centavos)) {
      throw new Error('Money deve ser representado em centavos (inteiro)');
    }
  }

  static centavos(valor: number): Money {
    return new Money(valor);
  }

  static reais(valor: number): Money {
    return new Money(Math.round(valor * 100));
  }

  static zero(): Money {
    return new Money(0);
  }

  get valorEmCentavos(): number {
    return this.centavos;
  }

  somar(outro: Money): Money {
    return new Money(this.centavos + outro.centavos);
  }

  subtrair(outro: Money): Money {
    return new Money(this.centavos - outro.centavos);
  }

  multiplicarPor(fator: number): Money {
    return new Money(Math.round(this.centavos * fator));
  }

  percentual(pct: number): Money {
    return new Money(Math.round(this.centavos * (pct / 100)));
  }

  maiorQue(outro: Money): boolean {
    return this.centavos > outro.centavos;
  }

  maiorOuIgualA(outro: Money): boolean {
    return this.centavos >= outro.centavos;
  }

  menorQue(outro: Money): boolean {
    return this.centavos < outro.centavos;
  }

  ehZero(): boolean {
    return this.centavos === 0;
  }

  formatado(): string {
    return (this.centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
