import uuidv4 from 'uuid/v4';
import Filesystem from '../src/filesystem';

describe('new Filesystem()', () => {
  it('creates a new filesystem', () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    expect(!!filesystem).toBe(true);
  });
});

describe('async new Filesystem().isMaster', () => {
  it('filesystem is not master before starting', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    expect(filesystem.isMaster).toBe(false);
  });
  it('filesystem is master after starting', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    await filesystem.start();
    expect(filesystem.isMaster).toBe(true);
    filesystem.finish();
  });
  it('filesystem is master after finishing', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    await filesystem.start();
    await filesystem.finish();
    expect(filesystem.isMaster).toBe(true);
  });
});

describe('async new Filesystem().isStarted()', () => {
  it('filesystem is not started before starting', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    expect(await filesystem.isStarted()).toBe(false);
    filesystem.finish();
  });
  it('filesystem is started after starting', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    await filesystem.start();
    expect(await filesystem.isStarted()).toBe(true);
    filesystem.finish();
  });
  it('filesystem is not started after finishing', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    await filesystem.start();
    await filesystem.finish();
    expect(await filesystem.isStarted()).toBe(false);
  });
});

describe('async new Filesystem().setConfig(config)', () => {
  it('sets config', async () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    await filesystem.start();
    await filesystem.setConfig({ hello: 'world' });
    expect(await filesystem.getConfig()).toEqual({ hello: 'world' });
    filesystem.finish();
  });
});

describe('new Filesystem().setConfig(config)', () => {
  it('sets config', () => {
    const filesystem = new Filesystem({ name: uuidv4() });
    filesystem.startSync();
    filesystem.setConfigSync({ hello: 'world' });
    expect(filesystem.getConfigSync()).toEqual({ hello: 'world' });
    filesystem.finish();
  });
});
