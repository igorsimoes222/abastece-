export interface PostoProps {
  id: string;
  nome: string;
  codigo: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export class Posto {
  readonly id: string;
  nome: string;
  codigo: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;

  constructor(props: PostoProps) {
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

  distanciaKm(latCliente: number, lngCliente: number): number {
    const raioTerraKm = 6371;
    const dLat = Posto.paraRadianos(latCliente - this.latitude);
    const dLng = Posto.paraRadianos(lngCliente - this.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(Posto.paraRadianos(this.latitude)) *
        Math.cos(Posto.paraRadianos(latCliente)) *
        Math.sin(dLng / 2) ** 2;
    return raioTerraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private static paraRadianos(graus: number): number {
    return (graus * Math.PI) / 180;
  }
}
