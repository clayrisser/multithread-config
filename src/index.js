import path from 'path';
import pkgDir from 'pkg-dir';
import Socket from './socket';
import State from './state';

export const configs = {};

export default class MultithreadConfig {
  constructor(options) {
    this.options = {
      timeout: 100,
      socket: true,
      name:
        require(path.resolve(pkgDir.sync(process.cwd()), 'package.json'))
          .name || 'some-config',
      ...options
    };
    if (this.options.socket) {
      this.socket = new Socket(this.options);
      this.socket.onUpdate = config => {
        const { name } = this.options;
        if (!configs[name]) configs[name] = new State();
        configs[name].config = config;
        this.onUpdate(configs[name].config);
      };
    }
  }

  get owner() {
    if (this._owner) return this._owner;
    const { socket } = this.options;
    if (!socket) {
      this._owner = true;
    } else {
      this._owner = this.socket.owner;
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
    if (socket) this.socket.config = configs[name].config;
    return configs[name].config;
  }

  get config() {
    const { name } = this.options;
    if (!configs[name]) configs[name] = new State();
    if (!this.owner) {
      let config = null;
      try {
        ({ config } = this.socket);
      } catch (err) {}
      if (config) configs[name].config = config;
    }
    return configs[name].config;
  }

  get alive() {
    return this.socket.alive();
  }

  onUpdate(config) {
    return config;
  }

  stop() {
    if (this.socket) {
      try {
        return this.socket.stop();
      } catch (err) {}
    }
    return null;
  }
}
