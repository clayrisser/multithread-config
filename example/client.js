import MultithreadConfig from '../src';

setTimeout(() => {
  const mc = new MultithreadConfig();
  console.log('client: config', mc.config);
}, 5000);
