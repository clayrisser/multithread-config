import MultithreadConfig from '../src';

const mc = new MultithreadConfig();

setTimeout(() => {
  console.log('client: config', mc.config);
}, 2000);

setTimeout(() => {
  console.log('client: config', mc.config);
}, 4000);
