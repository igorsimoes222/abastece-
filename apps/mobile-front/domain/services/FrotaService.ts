import { Veiculo } from '../entities/Veiculo';
import { Abastecimento } from '../entities/Abastecimento';

// Orquestra Veiculo + Abastecimento — é o que faltava pra conectar o limite
// mensal do veículo (perfil PJ) ao abastecimento de fato.
export class FrotaService {
  registrarAbastecimentoNoVeiculo(veiculo: Veiculo, abastecimento: Abastecimento): void {
    veiculo.registrarGasto(abastecimento.valor);
  }
}
