import Socket from '../src/socket';

(async () => {
  const socket = new Socket();
  await socket.start();
  await socket.setConfig({ hello: 'world' });
  const config = await socket.getConfig();
  socket.onUpdate = config => console.log('s config updated', config);
  console.log('s', config);
  setTimeout(() => socket.setConfig({ howdy: 'texas' }), 5000);
})();
