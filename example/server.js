import { getConfig, setConfig, stop } from '../src';

const config = getConfig();

console.log('server: before', config);
setConfig({ hello: 'world' }, { silent: false });
console.log('server: after', config);
setConfig({ howdy: 'texas' });
console.log('server: updated', config);

setTimeout(stop, 5000);
