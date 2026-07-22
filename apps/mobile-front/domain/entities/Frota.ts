export interface FrotaProps {
  id: string;
  cnpj: string;
  razaoSocial: string;
  clienteResponsavelId: string;
}

export class Frota {
  readonly id: string;
  readonly cnpj: string;
  razaoSocial: string;
  readonly clienteResponsavelId: string;

  constructor(props: FrotaProps) {
    if (!Frota.cnpjValido(props.cnpj)) {
      throw new Error(`CNPJ inválido: ${props.cnpj}`);
    }
    this.id = props.id;
    this.cnpj = props.cnpj;
    this.razaoSocial = props.razaoSocial;
    this.clienteResponsavelId = props.clienteResponsavelId;
  }

  static cnpjValido(cnpj: string): boolean {
    return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
  }
}
