const bcrypt = require('bcrypt');
const { json, bodyJson } = require('../http');
const { excedeuLimite, registrarTentativa } = require('../rateLimit');
const { cadastrar, login, verificarToken } = require('../auth/auth');
const { knex } = require('../db/db');

function registrar(router) {
  router.post('/auth/cadastro', async (req, res) => {
    const ip = req.socket.remoteAddress;
    if (excedeuLimite(ip)) return json(res, { ok: false, mensagem: 'Muitas tentativas, tente novamente mais tarde' }, 429);
    registrarTentativa(ip);

    const body = await bodyJson(req);
    const resultado = await cadastrar(body);
    return json(res, { ok: true, ...resultado }, 201);
  });

  router.post('/auth/login', async (req, res) => {
    const ip = req.socket.remoteAddress;
    if (excedeuLimite(ip)) return json(res, { ok: false, mensagem: 'Muitas tentativas, tente novamente mais tarde' }, 429);
    registrarTentativa(ip);

    const body = await bodyJson(req);
    const resultado = await login(body);
    return json(res, { ok: true, ...resultado });
  });

  router.get('/auth/me', async (req, res) => {
    const payload = verificarToken(req.headers['authorization']);
    const usuario = await knex('usuarios').where({ id: payload.id }).first();
    if (!usuario) return json(res, { ok: false, erro: 'Usuario nao encontrado' }, 404);
    const { senha_hash, ...seguro } = usuario;
    return json(res, { ok: true, usuario: seguro });
  });

  router.post('/auth/trocar-senha', async (req, res) => {
    const payload = verificarToken(req.headers['authorization']);
    const body = await bodyJson(req);
    const { senhaAtual, senhaNova } = body;
    if (!senhaAtual || !senhaNova) throw { status: 400, mensagem: 'Preencha todos os campos' };
    if (senhaNova.length < 8) throw { status: 400, mensagem: 'Nova senha deve ter no minimo 8 caracteres' };
    const usuario = await knex('usuarios').where({ id: payload.id }).first();
    if (!usuario) throw { status: 404, mensagem: 'Usuario nao encontrado' };
    const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    if (!senhaOk) throw { status: 401, mensagem: 'Senha atual incorreta' };
    const novoHash = await bcrypt.hash(senhaNova, 10);
    await knex('usuarios').where({ id: payload.id }).update({ senha_hash: novoHash });
    return json(res, { ok: true, mensagem: 'Senha alterada com sucesso' });
  });

  router.patch('/auth/perfil', async (req, res) => {
    const payload = verificarToken(req.headers['authorization']);
    const body = await bodyJson(req);
    const { nome, telefone } = body;
    if (!nome) throw { status: 400, mensagem: 'Nome e obrigatorio' };
    await knex('usuarios').where({ id: payload.id }).update({ nome, telefone: telefone ?? null });
    const usuario = await knex('usuarios').where({ id: payload.id }).first();
    const { senha_hash, ...seguro } = usuario;
    return json(res, { ok: true, usuario: seguro });
  });
}

module.exports = { registrar };
