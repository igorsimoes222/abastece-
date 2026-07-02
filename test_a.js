const net = require('net');
const HOST = '127.0.0.1';
const PORT = 2001;

async function sendCmd(socket, cmd) {
  return new Promise((resolve) => {
    let buf = '';
    let timer;
    const handler = (data) => {
      buf += data.toString('ascii');
      clearTimeout(timer);
      timer = setTimeout(() => { socket.removeListener('data', handler); resolve(buf); }, 500);
    };
    timer = setTimeout(() => { socket.removeListener('data', handler); resolve(buf || 'TIMEOUT'); }, 2000);
    socket.on('data', handler);
    socket.write(cmd);
  });
}

async function main() {
  const socket = new net.Socket();
  await new Promise((res, rej) => { socket.connect(PORT, HOST, res); socket.on('error', rej); });
  
  const a = await sendCmd(socket, '(&A)');
  console.log('(&A):', a);
  
  const v = await sendCmd(socket, '(&V)');
  console.log('(&V):', v);
  
  const s = await sendCmd(socket, '(&S)');
  console.log('(&S):', s);
  
  socket.destroy();
}
main().catch(console.error);
