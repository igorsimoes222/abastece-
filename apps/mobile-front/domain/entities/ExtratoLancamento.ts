import { Money } from '../shared/Money';
import { TipoLancamentoCarteira } from '../shared/Enums';

export interface ExtratoLancamentoProps {
  id: string;
  carteiraId: string;
  tipo: TipoLancamentoCarteira;
  valor: Money;
  descricao: string;
  referenciaId?: string;
}

export class ExtratoLancamento {
  readonly id: string;
  readonly carteiraId: string;
  readonly tipo: TipoLancamentoCarteira;
  readonly valor: Money;
  readonly descricao: string;
  readonly referenciaId?: string;
  readonly data: Date;

  constructor(props: ExtratoLancamentoProps) {
    this.id = props.id;
    this.carteiraId = props.carteiraId;
    this.tipo = props.tipo;
    this.valor = props.valor;
    this.descricao = props.descricao;
    this.referenciaId = props.referenciaId;
    this.data = new Date();
  }
}
