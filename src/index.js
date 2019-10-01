import Err from 'err';
import deasync from 'deasync';
import isPromise from 'is-promise';
import path from 'path';
import pkgDir from 'pkg-dir';
import Filesystem from './filesystem';
import Socket from './socket';

const rootPath = pkgDir.sync(process.cwd()) || process.cwd();

export default class MultithreadConfig {
  isStarted = false;

  constructor(options) {
    this.options = {
      socket: true,
      timeout: 100,
      name:
        require(path.resolve(rootPath, 'package.json')).name || 'some-config',
      ...options
    };
    if (this.options.socket) {
      this.socket = new Socket(this.options);
      this.socket.onUpdate = config => this.onUpdate(config);
    } else {
      this.filesystem = new Filesystem(this.options);
      this.filesystem.onUpdate = config => this.onUpdate(config);
    }
    process.on('SIGTERM', () => this.finish());
    process.on('SIGINT', () => this.finish());
  }

  set config(config) {
    return this.setConfigSync(config);
  }

  get config() {
    return this.getConfigSync();
  }

  get transport() {
    if (this.socket) return this.socket;
    return this.filesystem;
  }

  setConfigSync(config = {}, name) {
    if (!this.options.socket) {
      throw new Err('synchronous operations not enabled');
    }
    let setConfigSync = (config, name) => {
      return this.filesystem.setConfigSync(config, name);
    };
    if (this.socket) {
      setConfigSync = deasync(async (config, name) =>
        this.socket.setConfig(config, name)
      );
    }
    if (isPromise(this.preProcess)) {
      throw new Err('synchronous operations not enabled');
    }
    if (!this.isStarted) this.startSync();
    config = this.preProcess(config);
    setConfigSync(config, name);
    return this.getConfigSync(name);
  }

  getConfigSync(name) {
    if (!this.options.socket) {
      throw new Err('synchronous operations not enabled');
    }
    let getConfigSync = name => this.filesystem.getConfigSync(name);
    if (this.socket) {
      getConfigSync = deasync(async name => this.socket.getConfig(name));
    }
    if (isPromise(this.postProcess)) {
      throw new Err('synchronous operations not enabled');
    }
    if (!this.isStarted) this.startSync();
    const config = getConfigSync(name);
    return this.postProcess(config);
  }

  async setConfig(config = {}, name) {
    if (!this.isStarted) await this.start();
    config = await this.preProcess(config);
    await this.transport.setConfig(config, name);
    return this.getConfig(name);
  }

  async getConfig(name) {
    if (!this.isStarted) await this.start();
    let config = null;
    config = await this.transport.getConfig(name);
    return this.postProcess(config);
  }

  preProcess(config) {
    return config;
  }

  postProcess(config) {
    return config;
  }

  isMaster() {
    return this.transport.isMaster;
  }

  async start() {
    this.isStarted = true;
    if (this.options.sync) throw new Err('asynchronous operations not enabled');
    if (this.socket) return this.socket.start();
    return this.filesystem.start();
  }

  startSync() {
    this.isStarted = true;
    if (!this.options.sync) throw new Err('synchronous operations not enabled');
    if (this.socket) {
      const start = deasync(async () => this.socket.start());
      return start();
    }
    return this.filesystem.startSync();
  }

  onUpdate(config) {
    return config;
  }

  finishSync() {
    try {
      return this.transport.finishSync();
    } catch (err) {}
    return null;
  }

  async finish() {
    try {
      return this.transport.finish();
    } catch (err) {}
    return null;
  }
}
