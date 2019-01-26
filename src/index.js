import mergeConfiguration from 'merge-configuration';
import path from 'path';
import pkgDir from 'pkg-dir';
import Socket from './socket';
import State from './state';

const defaultOptions = {
  name:
    require(path.resolve(pkgDir.sync(process.cwd()), 'package.json')).name ||
    'some-config',
  socket: true
};
let socket = null;

export const configs = {};

export function setConfig(config = {}, options = {}) {
  options = { ...defaultOptions, ...options };
  const { name } = options;
  if (options.socket) {
    if (!socket) socket = new Socket(options);
    if (!socket.alive) socket.start();
  }
  if (!isOwner(options)) {
    throw new Error('process is not the owner of config');
  }
  if (isFree(name, options)) configs[name] = new State();
  configs[name].config = mergeConfiguration(configs[name].config, config, {
    level: 1,
    ...(options.mergeConfiguration || {})
  });
  return configs[name].config;
}

export function getConfig(options = {}) {
  options = { ...defaultOptions, ...options };
  const { name } = options;
  if (options.socket && !socket) socket = new Socket(options);
  let config = null;
  if (configs[name]) {
    ({ config } = configs[name]);
  } else if (socket) {
    try {
      config = socket.getConfig(name);
    } catch (err) {}
  }
  if (!config) {
    configs[name] = new State();
    ({ config } = configs[name]);
  }
  if (!isOwner()) setTimeout(stop, 100);
  return config;
}

export function isOwner(options = {}) {
  options = { ...defaultOptions, ...options };
  if (!options.socket) return true;
  if (!socket) socket = new Socket(options);
  return socket.started;
}

export function isFree(name, options = {}) {
  options = { ...defaultOptions, ...options };
  if (name) options.name = name;
  return !getConfig(options);
}

export function stop(options = {}) {
  options = { ...defaultOptions, ...options };
  if (!options.socket) return null;
  if (!socket) socket = new Socket(options);
  return socket.stop();
}

export default {
  getConfig,
  isFree,
  isOwner,
  setConfig,
  stop
};
