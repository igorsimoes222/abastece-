/**
 * Validação de variáveis de ambiente obrigatórias — falha rápido e visível
 * na subida do servidor em vez de rodar inseguro com valor padrão.
 *
 * Carrega o .env automaticamente (não commitado — ver .env.example pro
 * modelo). Assim "node src/index.js" ou "npm start" já sobe com tudo
 * definido, sem precisar prefixar a variável na mão toda vez.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

function exigir(nome) {
  const valor = process.env[nome];
  if (!valor) {
    console.error(`[env] Variável obrigatória ausente: ${nome}`);
    console.error('[env] O servidor não vai subir sem ela. Defina no .env ou no ambiente.');
    process.exit(1);
  }
  return valor;
}

const JWT_SECRET = exigir('JWT_SECRET');
const POSTO_CODIGO_PADRAO = process.env.POSTO_CODIGO_PADRAO || 'posto-dev';
const SERVER_PORT = parseInt(process.env.PORT || '3334');

module.exports = { JWT_SECRET, POSTO_CODIGO_PADRAO, SERVER_PORT };
