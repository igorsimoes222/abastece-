// Helpers HTTP compartilhados por todas as rotas — sem framework, de propósito.

function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  });
  res.end(body);
}

function bodyJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { resolve({}); }
    });
  });
}

module.exports = { json, bodyJson };
