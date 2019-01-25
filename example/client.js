import { getConfig } from '../src';

setTimeout(() => {
  console.log('client: config', getConfig('example'));
}, 4000);
