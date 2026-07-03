const net = require('net');

function calcChecksum(conteudo) {
  let soma = 0;
  for (let i = 0; i < conteudo.length; i++) soma += conteudo.charCodeAt(i);
  return (soma & 0xFF).toString(16).toUpperCase().padStart(2, '0');
}

function buildCmd(conteudo) {
  const kk = calcChecksum(conteudo);
  return '(' + conteudo + kk + ')';
}

async function send(sock, cmd) {
  return new Promise((resolve) => {
    let buf = '';
    let t;
    const onData = (d) => {
      buf += d.toString('ascii');
      clearTimeout(t);
      t = setTimeout(() => { sock.removeListener('data', onData); resolve(buf); }, 400);
    };
    t = setTimeout(() => { sock.removeListener('data', onData); resolve(buf || '(TIMEOUT)'); }, 3000);
    sock.on('data', onData);
    sock.write(cmd);
  });
}

async function main() {
  const sock = await new Promise((res, rej) => {
    const s = new net.Socket();
    s.connect(2001, '127.0.0.1', () => res(s));
    s.on('error', rej);
  });

  // Envia (&T09$) para liberar bico 09
  const autCmd = buildCmd('&T09$');
  console.log('TX:', autCmd);
  const autRx = await send(sock, autCmd);
  console.log('RX:', autRx);
  console.log('');
  console.log('>> Agora clique "Retirar Bico" no simulador (bico 09) <<');
  console.log('>> Polling (&V) por 30 segundos...\n');

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const vis = await send(sock, '(&V)');
    console.log(`[${new Date().toLocaleTimeString()}] (&V):`, vis);
    if (vis !== '(0)' && vis !== '(TIMEOUT)' && vis.trim() !== '(0)') {
      console.log('\n*** (&V) retornou dados! Funcionou! ***');
    }
  }

  sock.destroy();
}

main().catch(console.error);
