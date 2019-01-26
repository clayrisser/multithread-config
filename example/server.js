import MultithreadConfig from '../src';

const mc1 = new MultithreadConfig();
const config1 = mc1.config;
console.log('server1: before', config1);
mc1.config = { hello: 'world' };
console.log('server1: after', config1);
mc1.config = { ...mc1.config, howdy: 'texas' };
console.log('server1: updated', config1);
setTimeout(mc1.stop.bind(mc1), 7000);

const mc2 = new MultithreadConfig({
  name: 'config2',
  socket: false
});
const config2 = mc2.config;
console.log('server2: before', config2);
mc2.config = { a: 'A' };
console.log('server2: after', config2);
mc2.config = { ...mc2.config, b: 'B' };
console.log('server2: updated', config2);
mc2.stop();
