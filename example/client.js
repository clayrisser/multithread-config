import { getConfig } from '../src';

setTimeout(() => {
  console.log(
    'client: config',
    getConfig('example', { socket: { silent: false } })
  );
}, 4000);
