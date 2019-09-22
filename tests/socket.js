import uuidv4 from 'uuid/v4';
import Socket from '../src/socket';

describe('new Socket()', () => {
  const socket = new Socket({ name: uuidv4() });
  it('creates a new socket', () => {
    expect(!!socket).toBe(true);
  });
});

describe('async new Socket().isAlive()', () => {
  it('socket is not alive before starting', async () => {
    const socket = new Socket({ name: uuidv4() });
    expect(await socket.isAlive()).toBe(false);
  });
  it('socket is alive', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    expect(await socket.isAlive()).toBe(true);
    socket.stop();
  });
  it('socket is not alive after stopping', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    socket.stop();
    expect(await socket.isAlive()).toBe(false);
  });
});

describe('async new Socket().setConfig()', () => {
  it('sets config', async () => {
    const socket = new Socket({ name: uuidv4() });
    await socket.start();
    await socket.setConfig({ hello: 'world' });
    expect(await socket.getConfig()).toEqual({ hello: 'world' });
    socket.stop();
  });
});
