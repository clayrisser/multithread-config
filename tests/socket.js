import uuidv4 from 'uuid/v4';
import Socket from '../src/socket';

describe('new Socket()', () => {
  it('creates a new socket', () => {
    const socket = new Socket({ name: uuidv4() });
    expect(!!socket).toBe(true);
  });
});

describe('async new Socket().isStarted()', () => {
  it('socket is not started before starting', async () => {
    const socket = new Socket({ name: uuidv4() });
    expect(await socket.isStarted()).toBe(false);
  });
  it('socket is started after starting', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    expect(await socket.isStarted()).toBe(true);
    socket.finishSync();
  });
  it('socket is not started after finishing', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    socket.finishSync();
    expect(await socket.isStarted()).toBe(false);
  });
});

describe('async new Socket().isMaster', () => {
  it('socket is not master before starting', async () => {
    const socket = new Socket({ name: uuidv4() });
    expect(socket.isMaster).toBe(false);
  });
  it('socket is master after starting', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    expect(socket.isMaster).toBe(true);
    socket.finishSync();
  });
  it('socket is master after finishing', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    socket.finishSync();
    expect(socket.isMaster).toBe(true);
  });
});

describe('async new Socket().setConfig()', () => {
  it('sets config', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    await socket.setConfig({ hello: 'world' });
    expect(await socket.getConfig()).toEqual({ hello: 'world' });
    socket.finishSync();
  });
});
