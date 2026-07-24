// Não guarda "disponível/estado" aqui — esse dado é lido ao vivo do posto
// (agente local) e nunca é persistido, senão fica desatualizado no banco.
class Bico {
  constructor(props) {
    this.id = props.id;
    this.postoId = props.postoId;
    this.produtoId = props.produtoId;
    this.numero = props.numero.padStart(2, '0');
  }
}

module.exports = { Bico };
