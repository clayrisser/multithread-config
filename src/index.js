import deasync from 'deasync';
import path from 'path';
import pkgDir from 'pkg-dir';
import Socket from './socket';

const rootPath = pkgDir.sync(process.cwd()) || process.cwd();

export default class MultithreadConfig {
  constructor(options) {
    this.options = {
      timeout: 100,
      name:
        require(path.resolve(rootPath, 'package.json')).name || 'some-config',
      ...options
    };
    this.socket = new Socket(this.options);
    this.socket.onUpdate = config => this.onUpdate(config);
  }

  set config(config) {
    const setConfig = deasync(async () => this.setConfig(config));
    return setConfig(config);
  }

  get config() {
    const getConfig = deasync(async () => this.getConfig());
    return getConfig();
  }

  async setConfig(config = {}, name) {
    config = await this.preProcess(config);
    return this.socket.setConfig(config, name);
  }

  async getConfig(name) {
    const config = this.socket.getConfig(name);
    return this.postProcess(config);
  }

  async preProcess(config) {
    return config;
  }

  async postProcess(config) {
    return config;
  }

  async start() {
    return this.socket.start();
  }

  startSync() {
    const start = deasync(async () => this.start());
    return start();
  }

  onUpdate(config) {
    return config;
  }

  stop() {
    try {
      return this.socket.stop();
    } catch (err) {}
    return null;
  }
}
