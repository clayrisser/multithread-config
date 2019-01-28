import CircularJSON from 'circular-json';
import _ from 'lodash';
import ipc from 'node-ipc';
import path from 'path';
import pkgDir from 'pkg-dir';
import { sleep } from 'deasync';
import { configs } from '.';

const sockets = {};

export default class Socket {
  constructor(options = {}) {
    this.options = {
      cascadeStop: true,
      stopTimeout: 1000,
      timeout: 100,
      ...options
    };
    this.ipc = ipc;
    this.ipc.config = {
      ...this.ipc.config,
      retry: 1000,
      silent: true,
      id:
        require(path.resolve(pkgDir.sync(process.cwd()), 'package.json'))
          .name || 'some-ipc-id',
      ...(options.socket === true ? {} : options.socket)
    };
    process.on('uncaughtException', err => {
      if (/Cannot read property 'config' of undefined/.test(err.message)) {
        process.exit();
      } else {
        throw err;
      }
    });
  }

  get owner() {
    if (this._owner) return this._owner;
    this._owner = !this.alive || !!this.server;
    return this._owner;
  }

  get alive() {
    const { id } = this.ipc.config;
    let alive = false;
    let done = false;
    try {
      this.ipc.connectTo(id, () => {
        this.ipc.of[id].on('getConfig.res', () => {
          alive = true;
          done = true;
        });
        this.ipc.of[id].emit('getConfig.req', { pid: process.pid });
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
    return alive;
  }

  get server() {
    return this.ipc.server;
  }

  set config(config = {}) {
    if (this.owner) {
      _.each(sockets, socket => {
        this.ipc.server.emit(socket, 'updateConfig', {});
      });
    }
  }

  get config() {
    const { name } = this.options;
    const { id } = this.ipc.config;
    let done = false;
    let config = null;
    if (this.owner) return configs[name]?.config || null;
    try {
      this.ipc.connectTo(id, () => {
        this.listenToOwner();
        this.ipc.of[id].on('getConfig.res', res => {
          ({ config } = res);
          done = true;
        });
        this.ipc.of[id].emit('getConfig.req', { name, pid: process.pid });
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
    return config;
  }

  listenToOwner() {
    if (this.owner) return null;
    const { id } = this.ipc.config;
    if (this._listenToOwner) return null;
    this._listenToOwner = true;
    this.ipc.of[id].on('updateConfig', () => this.onUpdate(this.config));
    this.ipc.of[id].on('stop', () => {
      try {
        this.stop();
      } catch (err) {}
    });
    return null;
  }

  handleGetConfigRequest(req, socket) {
    if (this.owner && req.pid) sockets[req.pid] = socket;
    let config = configs[req.name]?.config || null;
    if (config) config = JSON.parse(CircularJSON.stringify(config));
    this.ipc.server.emit(socket, 'getConfig.res', { config });
  }

  onUpdate(config) {
    return config;
  }

  start() {
    let done = false;
    this.ipc.serve(() => {
      this.ipc.server.on(
        'getConfig.req',
        this.handleGetConfigRequest.bind(this)
      );
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
    const { cascadeStop, stopTimeout } = this.options;
    if (this.owner && cascadeStop) {
      _.each(sockets, socket => {
        this.ipc.server.emit(socket, 'stop', {});
      });
    }
    this.ipc.disconnect(id);
    const { server } = this.ipc;
    if (server) {
      if (server.server) ipc.server.server.close();
      server.stop();
      setTimeout(() => {
        process.exit();
      }, stopTimeout);
    }
    return null;
  }
}
