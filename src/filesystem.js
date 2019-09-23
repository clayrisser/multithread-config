import CircularJSON from 'circular-json';
import Err from 'err';
import fs from 'fs-extra';
import path from 'path';
import pkgDir from 'pkg-dir';
import { LazyGetter } from 'lazy-get-decorator';
import State from './state';

const rootPath = pkgDir.sync(process.cwd()) || process.cwd();
const pkg = require(path.resolve(rootPath, 'package.json'));

export default class Socket {
  isMaster = false;

  states = [];

  constructor(options = {}) {
    this.options = {
      name: pkg.name,
      configBasePath: path.resolve(rootPath, '.tmp/config'),
      ...options
    };
  }

  get name() {
    return this.options.name;
  }

  @LazyGetter()
  get configPath() {
    return path.resolve(this.options.configBasePath, this.name);
  }

  async detectIsMaster() {
    const configPath = `${this.configPath}.json`;
    if (!(await fs.exists(configPath))) throw new Err('master not started');
    return (
      JSON.parse((await fs.readFile(configPath)).toString())?.master?.pid ===
      process.pid
    );
  }

  detectIsMasterSync() {
    const configPath = `${this.configPath}.json`;
    if (!fs.existsSync(configPath)) throw new Err('master not started');
    return (
      JSON.parse(fs.readFileSync(configPath).toString())?.master?.pid ===
      process.pid
    );
  }

  async setConfig(config = {}, name) {
    if (!name) ({ name } = this);
    if (!this.isMaster && !(await this.detectIsMaster())) {
      return new Err('must be master to set config');
    }
    if (!this.states[name]) this.states[name] = new State();
    this.states[name].config = config;
    const configPath = path.resolve(this.configPath, `${name}.json`);
    await fs.mkdirs(this.configPath);
    await fs.writeFile(
      configPath,
      CircularJSON.stringify({ config, master: { pid: process.pid } })
    );
    return this.getConfig(name);
  }

  setConfigSync(config = {}, name) {
    if (!name) ({ name } = this);
    if (!this.isMaster && !this.detectIsMasterSync()) {
      return new Err('must be master to set config');
    }
    if (!this.states[name]) this.states[name] = new State();
    this.states[name].config = config;
    const configPath = path.resolve(this.configPath, `${name}.json`);
    fs.mkdirsSync(this.configPath);
    fs.writeFileSync(
      configPath,
      CircularJSON.stringify({
        config,
        master: { pid: process.pid }
      })
    );
    return this.getConfigSync(name);
  }

  async getConfig(name) {
    if (!name) ({ name } = this);
    if (this.isMaster) return this.states?.[name]?.config || null;
    const configPath = path.resolve(this.configPath, `${name}.json`);
    if (!(await fs.exists(configPath))) return null;
    return JSON.parse((await fs.readFile(configPath)).toString()).config;
  }

  getConfigSync(name) {
    if (!name) ({ name } = this);
    if (this.isMaster) return this.states?.[name]?.config || null;
    const configPath = path.resolve(this.configPath, `${name}.json`);
    if (!fs.existsSync(configPath)) return null;
    return JSON.parse(fs.readFileSync(configPath).toString()).config;
  }

  onUpdate(config) {
    return config;
  }

  isStartedSync() {
    const configPath = `${this.configPath}.json`;
    return !!fs.existsSync(configPath);
  }

  async isStarted() {
    const configPath = `${this.configPath}.json`;
    return !!(await fs.exists(configPath));
  }

  async start() {
    if (await this.isStarted()) return null;
    this.isMaster = true;
    const configPath = `${this.configPath}.json`;
    await fs.mkdirs(this.options.configBasePath);
    return fs.writeFile(
      configPath,
      CircularJSON.stringify({ master: { pid: process.pid } })
    );
  }

  startSync() {
    if (this.isStartedSync()) return null;
    this.isMaster = true;
    const configPath = `${this.configPath}.json`;
    fs.mkdirsSync(this.options.configBasePath);
    return fs.writeFileSync(
      configPath,
      CircularJSON.stringify({ master: { pid: process.pid } })
    );
  }

  finish() {
    fs.removeSync(`${this.configPath}.json`);
    return fs.removeSync(this.configPath);
  }
}
