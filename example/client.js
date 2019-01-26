import { getConfig } from '../src';

setTimeout(() => {
  console.log('client: config', getConfig({ socket: { silent: false } }));
}, 4000);
