class Posto {
  constructor(props) {
    this.id = props.id;
    this.nome = props.nome;
    this.codigo = props.codigo;
    this.cep = props.cep;
    this.rua = props.rua;
    this.numero = props.numero;
    this.bairro = props.bairro;
    this.cidade = props.cidade;
    this.estado = props.estado;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
  }

  distanciaKm(latCliente, lngCliente) {
    const raioTerraKm = 6371;
    const dLat = Posto.#paraRadianos(latCliente - this.latitude);
    const dLng = Posto.#paraRadianos(lngCliente - this.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(Posto.#paraRadianos(this.latitude)) *
        Math.cos(Posto.#paraRadianos(latCliente)) *
        Math.sin(dLng / 2) ** 2;
    return raioTerraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static #paraRadianos(graus) {
    return (graus * Math.PI) / 180;
  }
}

module.exports = { Posto };
