const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { knex } = require('../db/db');
const { JWT_SECRET } = require('../env');

// 7 dias em vez dos 30 anteriores — reduz a janela de um token vazado sem
// exigir infraestrutura completa de refresh token ainda (ver README).
const JWT_EXPIRES = '7d';

// ─── Cadastro ─────────────────────────────────────────────────────────────────
async function cadastrar({ nome, email, senha, telefone, cpf, perfil }) {
  if (!nome || !email || !senha)
    throw { status: 400, mensagem: 'nome, email e senha são obrigatórios' };

  const emailExiste = await knex('usuarios').where({ email: email.toLowerCase().trim() }).first();
  if (emailExiste)
    throw { status: 409, mensagem: 'E-mail já cadastrado' };

  let cpfLimpo = null;
  if (cpf) {
    cpfLimpo = cpf.replace(/\D/g, '');
    if (!/^\d{11}$/.test(cpfLimpo))
      throw { status: 400, mensagem: 'CPF inválido' };

    const cpfExiste = await knex('usuarios').where({ cpf: cpfLimpo }).first();
    if (cpfExiste)
      throw { status: 409, mensagem: 'CPF já cadastrado' };
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  const [id] = await knex('usuarios').insert({
    nome,
    email:       email.toLowerCase().trim(),
    senha_hash,
    telefone:    telefone || null,
    cpf:         cpfLimpo || null,
    perfil:      perfil   || 'pf',
    cashback_saldo: 0,
    ativo:       true,
  });

  const usuario = await knex('usuarios').where({ id }).first();
  const token   = gerarToken(usuario);

  return { token, usuario: limparUsuario(usuario) };
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login({ email, senha }) {
  if (!email || !senha)
    throw { status: 400, mensagem: 'email e senha são obrigatórios' };

  const usuario = await knex('usuarios')
    .where({ email: email.toLowerCase().trim(), ativo: true })
    .first();

  if (!usuario)
    throw { status: 401, mensagem: 'E-mail ou senha inválidos' };

  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk)
    throw { status: 401, mensagem: 'E-mail ou senha inválidos' };

  const token = gerarToken(usuario);

  return { token, usuario: limparUsuario(usuario) };
}

// ─── Verificar token (middleware) ─────────────────────────────────────────────
function verificarToken(authHeader) {
  if (!authHeader?.startsWith('Bearer '))
    throw { status: 401, mensagem: 'Token não informado' };

  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    throw { status: 401, mensagem: 'Token inválido ou expirado' };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function limparUsuario(u) {
  const { senha_hash, ...seguro } = u;
  return seguro;
}

module.exports = { cadastrar, login, verificarToken };
