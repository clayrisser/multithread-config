import Socket from '../src/socket';

(async () => {
  const socket = new Socket();
  const config = await socket.getConfig();
  socket.onUpdate = config => console.log('c config updated', config);
  console.log('c', config);
})();
