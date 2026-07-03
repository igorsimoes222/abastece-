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
    t = setTimeout(() => { sock.removeListener('data', onData); resolve(buf || 'TIMEOUT'); }, 3000);
    sock.on('data', onData);
    sock.write(cmd);
    console.log('TX:', JSON.stringify(cmd));
  });
}

async function main() {
  const sock = await new Promise((res, rej) => {
    const s = new net.Socket();
    s.connect(2001, '127.0.0.1', () => res(s));
    s.on('error', rej);
  });
  console.log('Conectado\n');

  // 1. Lê status atual
  const status = await send(sock, '(&S)');
  console.log('RX (&S):', JSON.stringify(status));
  // F=Livre, E=Espera, T=Pronta, A=Abastecendo, C=Concluiu, B=Bloqueada
  const m = status.match(/\(S(.+)\)/);
  if (m) {
    [...m[1]].forEach((e, i) => {
      if (e !== 'F') console.log(`  Bico ${String(i+1).padStart(2,'0')}: ${e}`);
    });
  }
  console.log('');
  await new Promise(r => setTimeout(r, 500));

  // 2. Tenta (&P) para bico 09 com formato sem tipo
  console.log('\n--- Teste: (&P) sem tipo para bico 09 ---');
  const rx1 = await send(sock, buildCmd('&P09' + '005000'));
  console.log('RX:', JSON.stringify(rx1));
  await new Promise(r => setTimeout(r, 500));

  // 3. Tenta (&P) para bico 01 (provavelmente Livre)
  console.log('\n--- Teste: (&P) para bico 01 ---');
  const rx2 = await send(sock, buildCmd('&P01' + '005000'));
  console.log('RX:', JSON.stringify(rx2));
  await new Promise(r => setTimeout(r, 500));

  // 4. Verifica se simulador suporta (&P) - tenta formato com $ para bico 01
  console.log('\n--- Teste: (&P$) para bico 01 ---');
  const rx3 = await send(sock, buildCmd('&P01$' + '005000'));
  console.log('RX:', JSON.stringify(rx3));

  sock.destroy();
}

main().catch(console.error);
