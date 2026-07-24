class Frota {
  constructor(props) {
    if (!Frota.cnpjValido(props.cnpj)) {
      throw new Error(`CNPJ inválido: ${props.cnpj}`);
    }
    this.id = props.id;
    this.cnpj = props.cnpj;
    this.razaoSocial = props.razaoSocial;
    this.clienteResponsavelId = props.clienteResponsavelId;
  }

  static cnpjValido(cnpj) {
    return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
  }
}

module.exports = { Frota };
