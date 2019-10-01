import uuidv4 from 'uuid/v4';
import MultithreadConfig from '../src';

describe('new MultithreadConfig()', () => {
  it('creates a new multithread config', () => {
    const mc = new MultithreadConfig({ name: uuidv4() });
    expect(!!mc).toBe(true);
  });
});

describe('async new MultithreadConfig().[set,get]Config(config)', () => {
  it('sets and gets config', async () => {
    const mc = new MultithreadConfig({ name: uuidv4() });
    await mc.setConfig({ hello: 'world' });
    expect(await mc.getConfig()).toEqual({ hello: 'world' });
  });
});

// describe('new MultithreadConfig().[set,get]ConfigSync(config)', () => {
//   it('sets and gets config', () => {
//     const mc = new MultithreadConfig({ name: uuidv4() });
//     mc.startSync();
//     mc.setConfigSync({ hello: 'world' });
//     expect(mc.getConfigSync()).toEqual({ hello: 'world' });
//   });
// });

describe('async new MultithreadConfig({ socket: false }).[set,get]Config(config)', () => {
  it('sets and gets config', async () => {
    const mc = new MultithreadConfig({ name: uuidv4(), socket: false });
    await mc.setConfig({ hello: 'world' });
    expect(await mc.getConfig()).toEqual({ hello: 'world' });
    await mc.finish();
  });
  it('sets and gets config sync', () => {
    const mc = new MultithreadConfig({ name: uuidv4(), socket: false });
    mc.setConfigSync({ hello: 'world' });
    expect(mc.getConfigSync()).toEqual({ hello: 'world' });
    mc.finishSync();
  });
});

describe('new MultithreadConfig().onUpdate = () => {}', () => {
  it('updates config', async () => {
    const mc = new MultithreadConfig({ name: uuidv4() });
    await mc.setConfig({ hello: 'world' });
    setTimeout(() => mc.setConfig({ howdy: 'texas' }), 100);
    await new Promise(r => (mc.onUpdate = r));
    expect(await mc.getConfig()).toEqual({ howdy: 'texas' });
  });
});

describe('new MultithreadConfig({ socket: false }).onUpdate = () => {}', () => {
  it('updates config', async () => {
    const mc = new MultithreadConfig({ name: uuidv4(), socket: false });
    await mc.setConfig({ hello: 'world' });
    setTimeout(() => mc.setConfig({ howdy: 'texas' }), 100);
    await new Promise(r => (mc.onUpdate = r));
    expect(await mc.getConfig()).toEqual({ howdy: 'texas' });
    await mc.finish();
  });
});
