import config, { setConfig, stop } from '../src';

console.log('server: before', config);
setConfig('example', { hello: 'world' });
console.log('server: after', config);
setConfig('example', { howdy: 'texas' });
console.log('server: updated', config);

setTimeout(stop, 5000);
