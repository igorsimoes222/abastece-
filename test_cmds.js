const net = require('net');

const HOST = '127.0.0.1';
const PORT = 2001;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testCmd(socket, cmd) {
  return new Promise((resolve) => {
    let buf = '';
    let timer;
    
    const handler = (data) => {
      buf += data.toString('ascii');
      clearTimeout(timer);
      timer = setTimeout(() => {
        socket.removeListener('data', handler);
        resolve(buf);
      }, 500);
    };
    
    timer = setTimeout(() => {
      socket.removeListener('data', handler);
      resolve(buf || 'TIMEOUT');
    }, 2000);
    
    socket.on('data', handler);
    socket.write(cmd);
  });
}

async function main() {
  const socket = new net.Socket();
  
  await new Promise((res, rej) => {
    socket.connect(PORT, HOST, res);
    socket.on('error', rej);
  });
  console.log('Conectado!');
  await sleep(200);
  
  const cmds = [
    ['(&S)', 'STATUS'],
    ['(&V)', 'VISUALIZACAO'],
    ['(&A)', 'ABASTECIMENTO'],
    ['(&I)', 'INCREMENT'],
    ['(&L)', 'LIBERAR (sem params)'],
    ['(&P)', 'PRE-DET (sem params)'],
    ['(&R)', 'COMANDO R'],
    ['(&C)', 'COMANDO C'],
  ];
  
  for (const [cmd, name] of cmds) {
    console.log('TX [' + name + ']: ' + cmd);
    const resp = await testCmd(socket, cmd);
    console.log('RX: ' + resp);
    await sleep(300);
  }
  
  // Tentar autorizar bico 04 com diferentes formatos
  console.log('\n--- Tentativas de autorizacao bico 04 ---');
  const authCmds = [
    ['(&L04)', 'L04'],
    ['(&L04050000)', 'L04 + valor 50.00'],
    ['(&P04050000)', 'P04 + valor 50.00'],
    ['(&P045000)', 'P04 + valor 5000'],
    ['(&R04)', 'R04'],
  ];
  
  for (const [cmd, name] of authCmds) {
    console.log('TX [' + name + ']: ' + cmd);
    const resp = await testCmd(socket, cmd);
    console.log('RX: ' + resp);
    await sleep(500);
  }
  
  socket.destroy();
  console.log('Pronto.');
}

main().catch(console.error);
