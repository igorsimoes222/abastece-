/**
 * Dispatcher de rotas manual — sem framework, só organizado por arquivo em
 * vez de um único if/else gigante. Suporta parâmetro de caminho (:id).
 */

function compilarPadrao(caminho) {
  const nomesParams = [];
  const regexStr = caminho
    .split('/')
    .map((parte) => {
      if (parte.startsWith(':')) {
        nomesParams.push(parte.slice(1));
        return '([^/]+)';
      }
      return parte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp('^' + regexStr + '$'), nomesParams };
}

function criarRouter() {
  const rotas = [];

  function adicionar(method, caminho, handler) {
    const { regex, nomesParams } = compilarPadrao(caminho);
    rotas.push({ method, regex, nomesParams, handler });
  }

  async function despachar(req, res, url) {
    for (const rota of rotas) {
      if (rota.method !== req.method) continue;
      const match = url.match(rota.regex);
      if (!match) continue;

      const params = {};
      rota.nomesParams.forEach((nome, i) => { params[nome] = match[i + 1]; });

      await rota.handler(req, res, params);
      return true;
    }
    return false;
  }

  return {
    get:    (caminho, handler) => adicionar('GET', caminho, handler),
    post:   (caminho, handler) => adicionar('POST', caminho, handler),
    patch:  (caminho, handler) => adicionar('PATCH', caminho, handler),
    despachar,
  };
}

module.exports = { criarRouter };
