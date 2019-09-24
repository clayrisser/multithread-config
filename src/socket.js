import CircularJSON from 'circular-json';
import _ from 'lodash';
import ipc from 'node-ipc';
import path from 'path';
import pkgDir from 'pkg-dir';
import { mapSeries } from 'bluebird';
import State from './state';

const rootPath = pkgDir.sync(process.cwd()) || process.cwd();
const pkg = require(path.resolve(rootPath, 'package.json'));
const sockets = {};

export default class Socket {
  isMaster = false;

  states = [];

  events = new Set();

  constructor(options = {}) {
    this.options = {
      cascadeStop: true,
      stopTimeout: 1000,
      timeout: 100,
      name: pkg.name,
      ...options
    };
    this.ipc = ipc;
    this.ipc.config = {
      ...this.ipc.config,
      retry: 1000,
      silent: true,
      id: this.options.name,
      ...(options.socket === true ? {} : options.socket)
    };
    process.on('uncaughtException', err => {
      if (/Cannot read property 'config' of undefined/.test(err.message)) {
        process.exit(1);
      }
      throw err;
    });
  }

  async isStarted() {
    return new Promise((resolve, reject) => {
      try {
        return this.connectToServer(() => {
          this.serverOn('ping.res', () => resolve(true));
          this.clientEmit('ping.req');
          setTimeout(() => resolve(false), this.options.timeout);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  get name() {
    return this.options.name;
  }

  async setConfig(config = {}, name) {
    if (!name) ({ name } = this);
    if (this.isMaster) {
      if (!this.states[name]) this.states[name] = new State();
      this.states[name].config = config;
    }
    await mapSeries(Object.values(sockets), async socket => {
      const result = new Promise((resolve, reject) => {
        try {
          return this.clientOn('updateConfig.res', resolve);
        } catch (err) {
          return reject(err);
        }
      });
      this.serverEmit(socket, 'updateConfig.req', {});
      return result;
    });
    const updatedConfig = await this.getConfig(name);
    this.onUpdate(updatedConfig);
    return updatedConfig;
  }

  async getConfig(name) {
    if (!name) ({ name } = this);
    if (this.isMaster) return this.states?.[name]?.config || {};
    return new Promise((resolve, reject) => {
      try {
        return this.connectToServer(() => {
          this.serverOn('updateConfig.req', async () => {
            this.onUpdate(await this.getConfig(name));
            this.clientEmit('updateConfig.res', {});
          });
          this.serverOn('stop.req', async () => {
            try {
              await this.finish();
            } catch (err) {}
          });
          this.serverOn('getConfig.res', res => {
            return resolve(res?.config || null);
          });
          this.clientEmit('getConfig.req', {
            name,
            pid: process.pid
          });
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  async start() {
    if (await this.isStarted()) return null;
    this.isMaster = true;
    return new Promise((resolve, reject) => {
      try {
        this.ipc.serve(() => {
          this.clientOn('getConfig.req', (req, socket) => {
            if (req.pid) sockets[req.pid] = socket;
            const config = JSON.parse(
              CircularJSON.stringify(this.states?.[req.name]?.config || {})
            );
            this.serverEmit(socket, 'getConfig.res', { config });
          });
          this.clientOn('ping.req', (req, socket) => {
            if (req.pid) sockets[req.pid] = socket;
            this.serverEmit(socket, 'ping.res');
          });
          return resolve(null);
        });
        return this.ipc.server.start();
      } catch (err) {
        return reject(err);
      }
    });
  }

  onUpdate(config) {
    return config;
  }

  async finish() {
    return new Promise(r => this.finishSync(r));
  }

  finishSync(cb = f => f) {
    const { id } = this.ipc.config;
    const { cascadeStop, stopTimeout } = this.options;
    if (this.isMaster && cascadeStop) {
      _.each(sockets, socket => {
        this.ipc.server.emit(socket, 'stop.req', {});
      });
    }
    this.ipc.disconnect(id);
    const { server } = this.ipc;
    if (server) {
      if (server.server) ipc.server.server.close();
      server.stop();
      setTimeout(() => {
        cb();
        process.exit();
      }, stopTimeout);
    }
  }

  connectToServer(callback) {
    const { id } = this.ipc.config;
    return this.ipc.connectTo(id, callback);
  }

  serverOn(event, callback) {
    // if (this.events.has(event)) return null;
    this.events.add(event);
    const { id } = this.ipc.config;
    return this.ipc.of[id].on(event, callback);
  }

  clientOn(event, callback) {
    // if (this.events.has(event)) return null;
    this.events.add(event);
    return this.ipc.server.on(event, callback);
  }

  serverEmit(socket, event, payload) {
    return this.ipc.server.emit(socket, event, payload);
  }

  clientEmit(event, payload) {
    const { id } = this.ipc.config;
    return this.ipc.of[id].emit(event, payload);
  }
}
