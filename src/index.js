import path from 'path';
import pkgDir from 'pkg-dir';
import Socket from './socket';
import State from './state';

export const configs = {};

export default class MultithreadConfig {
  constructor(options) {
    this.options = {
      timeout: 1000,
      socket: true,
      name:
        require(path.resolve(pkgDir.sync(process.cwd()), 'package.json'))
          .name || 'some-config',
      ...options
    };
    if (this.options.socket) this.socket = new Socket(this.options);
  }

  get owner() {
    if (this._owner) return this._owner;
    const { socket } = this.options;
    if (!socket) {
      this._owner = true;
    } else {
      this._owner = !this.socket.alive || !!this.socket.server;
    }
    return this._owner;
  }

  get free() {
    return !this.config;
  }

  set config(config = {}) {
    const { name, socket } = this.options;
    if (socket) {
      if (!this.socket.alive) this.socket.start();
    }
    if (!this.owner) throw new Error('process is not the owner of config');
    if (this.free) configs[name] = new State();
    configs[name].config = config;
    return configs[name].config;
  }

  get config() {
    const { name, timeout } = this.options;
    let config = null;
    if (configs[name]) {
      ({ config } = configs[name]);
    } else if (this.socket) {
      try {
        ({ config } = this.socket);
      } catch (err) {}
    }
    if (!config) {
      configs[name] = new State();
      ({ config } = configs[name]);
    }
    if (!this.owner) setTimeout(this.stop.bind(this), timeout);
    return config;
  }

  stop() {
    if (this.socket) this.socket.stop();
  }
}
