import CircularJSON from 'circular-json';
import { sleep } from 'deasync';
import ipc from 'node-ipc';
import { configs } from '.';

export default class Socket {
  started = false;

  constructor(config = {}) {
    const { socket = {}, timeout = 1000 } = config;
    this.ipc = ipc;
    this.timeout = timeout;
    this.ipc.config = {
      ...this.ipc.config,
      id: 'some-socket',
      retry: 1000,
      silent: true,
      ...socket
    };
  }

  get alive() {
    const { id } = this.ipc.config;
    let alive = false;
    let done = false;
    try {
      this.ipc.connectTo(id, () => {
        this.ipc.of[id].on('config.res', () => {
          alive = true;
          done = true;
        });
        this.ipc.of[id].emit('config.req', {});
        sleep(this.timeout);
        done = true;
      });
    } catch (err) {
      done = true;
    }
    while (!done) sleep(100);
    this.ipc.disconnect(id);
    return alive;
  }

  getConfig(name) {
    const { id } = this.ipc.config;
    let done = false;
    let error = null;
    let config = null;
    try {
      this.ipc.connectTo(id, () => {
        this.ipc.of[id].on('config.res', res => {
          ({ config } = res);
          done = true;
        });
        this.ipc.of[id].emit('config.req', { name });
        sleep(this.timeout);
        done = true;
      });
    } catch (err) {
      error = err;
      done = true;
    }
    while (!done) sleep(100);
    this.ipc.disconnect(id);
    if (error) throw error;
    return config;
  }

  handleConfigRequest(res, socket) {
    let config = configs[res.name] || null;
    if (config) config = JSON.parse(CircularJSON.stringify(config));
    this.ipc.server.emit(socket, 'config.res', { config });
  }

  start() {
    let done = false;
    this.ipc.serve(() => {
      this.ipc.server.on('config.req', this.handleConfigRequest.bind(this));
      done = true;
    });
    this.ipc.server.start();
    while (!done) sleep(100);
    this.started = true;
    return null;
  }

  stop() {
    const { id } = this.ipc.config;
    this.ipc.disconnect(id);
    const { server } = this.ipc;
    if (server) server.stop();
    return null;
  }
}
