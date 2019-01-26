import CircularJSON from 'circular-json';
import ipc from 'node-ipc';
import path from 'path';
import pkgDir from 'pkg-dir';
import { sleep } from 'deasync';
import { configs } from '.';

export default class Socket {
  constructor(options = {}) {
    this.options = {
      timeout: 1000,
      ...options
    };
    this.ipc = ipc;
    this.ipc.config = {
      ...this.ipc.config,
      retry: 1000,
      silent: true,
      ...(options.socket === true ? {} : options.socket),
      id:
        require(path.resolve(pkgDir.sync(process.cwd()), 'package.json'))
          .name || 'some-ipc-id'
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
        sleep(this.options.timeout);
        done = true;
      });
    } catch (err) {
      done = true;
    }
    while (!done) {
      try {
        sleep(100);
      } catch (err) {}
    }
    this.ipc.disconnect(id);
    return alive;
  }

  get server() {
    return this.ipc.server;
  }

  get config() {
    const { name } = this.options;
    const { id } = this.ipc.config;
    let done = false;
    let config = null;
    try {
      this.ipc.connectTo(id, () => {
        this.ipc.of[id].on('config.res', res => {
          ({ config } = res);
          done = true;
        });
        this.ipc.of[id].emit('config.req', { name });
        sleep(this.options.timeout);
        done = true;
      });
    } catch (err) {
      done = true;
    }
    while (!done) {
      try {
        sleep(100);
      } catch (err) {}
    }
    this.ipc.disconnect(id);
    return config;
  }

  handleConfigRequest(res, socket) {
    let config = configs[res.name]?.config || null;
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
    while (!done) {
      try {
        sleep(100);
      } catch (err) {}
    }
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
