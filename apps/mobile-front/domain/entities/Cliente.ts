export interface ClienteProps {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date;
}

export class Cliente {
  readonly id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date;

  constructor(props: ClienteProps) {
    if (!Cliente.cpfValido(props.cpf)) {
      throw new Error(`CPF inválido: ${props.cpf}`);
    }
    this.id = props.id;
    this.nome = props.nome;
    this.email = props.email;
    this.cpf = props.cpf;
    this.telefone = props.telefone;
    this.dataNascimento = props.dataNascimento;
  }

  static cpfValido(cpf: string): boolean {
    return /^\d{11}$/.test(cpf.replace(/\D/g, ''));
  }

  ehMaiorDeIdade(hoje: Date = new Date()): boolean {
    let idade = hoje.getFullYear() - this.dataNascimento.getFullYear();
    const aniversarioJaOcorreu =
      hoje.getMonth() > this.dataNascimento.getMonth() ||
      (hoje.getMonth() === this.dataNascimento.getMonth() && hoje.getDate() >= this.dataNascimento.getDate());
    if (!aniversarioJaOcorreu) idade -= 1;
    return idade >= 18;
  }
}
