import MultithreadConfig from '../src';

(async () => {
  const mc = new MultithreadConfig();
  await mc.start();
  mc.onUpdate = config => console.log('s updated', config);
  await mc.setConfig({ hello: 'world' });
  console.log('s', await mc.getConfig());
  setTimeout(() => mc.setConfig({ howdy: 'texas' }), 5000);
})();
