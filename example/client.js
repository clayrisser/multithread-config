import MultithreadConfig from '../src';

(async () => {
  const mc = new MultithreadConfig();
  mc.onUpdate = config => console.log('c updated', config);
  const config = await mc.getConfig();
  console.log('c', config);
})();
