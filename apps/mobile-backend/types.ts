// ─── Tipos do banco de dados — Abastece+ ─────────────────────────────────────
// Reflete exatamente as tabelas do db.js + o diagrama do modelo de dados

// ─── Usuario (Cliente) ────────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  senha_hash: string;
  token_fcm?: string;          // token push notification
  cashback_saldo: number;      // saldo de cashback em reais
  perfil: 'pf' | 'pj';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Posto ────────────────────────────────────────────────────────────────────
export interface Posto {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;                 // ex: "SP", "RJ"
  lat?: number;
  lng?: number;
  ip_horustech?: string;       // IP do concentrador CBC no posto
  porta_horustech: number;     // padrão 2001
  preco_gasolina?: number;
  preco_etanol?: number;
  preco_diesel?: number;
  cashback_pct: number;        // percentual de cashback ex: 1 = 1%
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Produto (Combustível) ────────────────────────────────────────────────────
export interface Produto {
  id: number;
  descricao: string;           // ex: "Gasolina Comum", "Etanol", "Diesel S10"
  codigo: string;              // código interno
}

// ─── Bico ─────────────────────────────────────────────────────────────────────
export interface Bico {
  id: number;
  posto_id?: number;           // FK → Posto
  produto_id?: number;         // FK → Produto
  numero: string;              // número físico na bomba ex: "09"
  numero_cbc?: string;         // endereço lógico no concentrador CBC ex: "4D"
  codigo_adesivo?: string;     // código colado na bomba que o cliente digita
  combustivel: string;         // ex: "Etanol"
  ativo: boolean;
}

// ─── Autorização ─────────────────────────────────────────────────────────────
export interface Autorizacao {
  id: number;
  usuario_id: number;          // FK → Usuario
  status: 'pendente' | 'autorizado' | 'cancelado' | 'expirado';
  data: string;
  horario: string;
  valor: number;               // valor autorizado em reais
}

// ─── Abastecimento ────────────────────────────────────────────────────────────
export interface Abastecimento {
  id: number;
  autorizacao_id?: number;     // FK → Autorizacao
  usuario_id?: number;         // FK → Usuario
  posto_id?: number;           // FK → Posto
  bico_id?: number;            // FK → Bico
  bico_numero: string;         // número do bico ex: "09"
  valor_autorizado: number;    // valor programado no app
  valor_cobrado?: number;      // valor real abastecido
  volume_litros?: number;
  preco_litro?: number;
  cashback_gerado?: number;
  combustivel?: string;
  status: 'aguardando' | 'abastecendo' | 'concluido' | 'cancelado' | 'erro';
  ciclo_id?: string;           // ID interno do ciclo
  iniciado_em?: string;
  concluido_em?: string;
  created_at: string;
  updated_at: string;
}

// ─── Finalizadora (maquininha/método) ─────────────────────────────────────────
export interface Finalizadora {
  id: number;
  descricao: string;           // ex: "Cielo Crédito", "PIX", "Dinheiro"
  codigo: string;              // código interno
}

// ─── Pagamento ────────────────────────────────────────────────────────────────
export interface Pagamento {
  id: number;
  abastecimento_id: number;    // FK → Abastecimento
  usuario_id: number;          // FK → Usuario
  finalizadora_id?: number;    // FK → Finalizadora
  valor: number;
  metodo: 'credito' | 'debito' | 'pix' | 'dinheiro' | 'cashback';
  status: 'pendente' | 'aprovado' | 'recusado' | 'estornado';
  tid_operadora?: string;      // ID da transação Cielo/Getnet
  autorizacao?: string;
  processado_em?: string;
  created_at: string;
  updated_at: string;
}

// ─── Cupom ────────────────────────────────────────────────────────────────────
export interface Cupom {
  id: number;
  pagamento_id: number;        // FK → Pagamento
  data: string;
  horario: string;
  codigo: string;              // código do cupom fiscal
}

// ─── Histórico ────────────────────────────────────────────────────────────────
export interface Historico {
  id: number;
  pagamento_id: number;        // FK → Pagamento
}

// ─── Devendo (inadimplência) ──────────────────────────────────────────────────
export interface Devendo {
  id: number;
  pagamento_id: number;        // FK → Pagamento
  valor_devido: number;
  data_ocorrencia: string;
  status: 'pendente' | 'quitado' | 'em_negociacao';
}

// ─── Cartão salvo ─────────────────────────────────────────────────────────────
export interface Cartao {
  id: number;
  usuario_id: number;          // FK → Usuario
  bandeira?: string;           // ex: "visa", "mastercard", "elo"
  ultimos_digitos?: string;    // 4 últimos dígitos
  token_operadora?: string;    // token Cielo/Getnet — nunca salva número completo
  apelido?: string;            // ex: "Nubank crédito"
  padrao: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Cashback Extrato ─────────────────────────────────────────────────────────
export interface CashbackExtrato {
  id: number;
  usuario_id: number;          // FK → Usuario
  abastecimento_id?: number;   // FK → Abastecimento
  valor: number;
  tipo: 'credito' | 'debito';
  descricao?: string;
  created_at: string;
  updated_at: string;
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

// Resposta padrão da API
export interface ApiResponse<T = unknown> {
  ok: boolean;
  mensagem?: string;
  erro?: string;
  data?: T;
}

// Dados retornados pelo (&V) — bico abastecendo em tempo real
export interface BicoAtivo {
  bico: string;
  valor: string;               // ex: "10.41"
}

// Dados retornados pelo (&A) — registro finalizado
export interface RegistroCBC {
  bico: string;
  valor: string;
  volume: string;
  preco: string;
  data: string;
}
