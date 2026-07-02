const net = require('net');
const HOST = '127.0.0.1';
const PORT = 2001;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendCmd(socket, cmd) {
  return new Promise((resolve) => {
    let buf = '';
    let timer;
    const handler = (data) => {
      buf += data.toString('ascii');
      clearTimeout(timer);
      timer = setTimeout(() => { socket.removeListener('data', handler); resolve(buf); }, 400);
    };
    timer = setTimeout(() => { socket.removeListener('data', handler); resolve(buf || 'TIMEOUT'); }, 2000);
    socket.on('data', handler);
    socket.write(cmd);
  });
}

async function main() {
  const socket = new net.Socket();
  await new Promise((res, rej) => { socket.connect(PORT, HOST, res); socket.on('error', rej); });
  console.log('Conectado ao SimuladorCBC. Polling (&V) por 30 segundos...');
  console.log('>>> CLIQUE AGORA em "Retirar Bico" no Canal 2 do SimuladorCBC! <<<\n');
  
  for (let i = 0; i < 15; i++) {
    const v = await sendCmd(socket, '(&V)');
    const s = await sendCmd(socket, '(&S)');
    const ts = new Date().toLocaleTimeString();
    console.log(`[${ts}] (&V)=${v}  (&S)=${s.substring(0,30)}...`);
    await sleep(2000);
  }
  
  socket.destroy();
  console.log('\nFim do polling.');
}

main().catch(console.error);
