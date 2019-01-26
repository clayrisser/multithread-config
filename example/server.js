import config, { setConfig, stop } from '../src';

console.log('server: before', config);
setConfig({ hello: 'world' }, { silent: false });
console.log('server: after', config);
setConfig({ howdy: 'texas' });
console.log('server: updated', config);

setTimeout(stop, 5000);
