import { Money } from '../shared/Money';
import { Autorizacao } from '../entities/Autorizacao';
import { Abastecimento } from '../entities/Abastecimento';

export interface IniciarAbastecimentoProps {
  id: string;
  autorizacao: Autorizacao;
  data: Date;
  litros: number;
  valor: Money;
  sequencial: number;
}

// Orquestra Autorizacao + Abastecimento — nenhuma das duas classes sabe da
// outra sozinha; quem liga as duas é este service.
export class AutorizacaoService {
  liberar(autorizacao: Autorizacao): void {
    autorizacao.liberar();
  }

  iniciarAbastecimento(props: IniciarAbastecimentoProps): Abastecimento {
    if (!props.autorizacao.podeGerarAbastecimento()) {
      throw new Error('Autorização precisa estar liberada para iniciar um abastecimento');
    }
    if (props.valor.maiorQue(props.autorizacao.valor)) {
      throw new Error('Abastecimento não pode ultrapassar o valor autorizado no bico');
    }

    const abastecimento = new Abastecimento({
      id: props.id,
      autorizacaoId: props.autorizacao.id,
      bicoId: props.autorizacao.bicoId,
      data: props.data,
      litros: props.litros,
      valor: props.valor,
      sequencial: props.sequencial,
    });

    props.autorizacao.concluir();
    return abastecimento;
  }
}
