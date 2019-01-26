import mergeConfiguration from 'merge-configuration';
import path from 'path';
import pkgDir from 'pkg-dir';
import Socket from './socket';
import State from './state';

const defaultOptions = { socket: true };
const pkg = require(path.resolve(pkgDir.sync(process.cwd()), 'package.json'));
const state = new State();
let socket = null;

export const configs = {};

export function setConfig(
  config = {},
  options = defaultOptions,
  name = pkg.name
) {
  if (options.socket) {
    if (!socket) socket = new Socket(options);
    if (!socket.alive) socket.start();
  }
  if (!isOwner(options)) {
    throw new Error('process is not the owner of config');
  }
  state.config = mergeConfiguration(state.config, config, {
    level: 1,
    ...(options.mergeConfiguration || {})
  });
  if (isFree(name)) configs[name] = state.config;
  return state.config;
}

export function getConfig(options = defaultOptions, name = pkg.name) {
  if (options.socket && !socket) socket = new Socket(options);
  let config = null;
  if (configs[name]) {
    config = configs[name];
  } else if (socket) {
    try {
      config = socket.getConfig(name);
    } catch (err) {}
  }
  if (!isOwner()) setTimeout(stop, 100);
  return config;
}

export function isOwner(options = defaultOptions) {
  if (!options.socket) return true;
  if (!socket) socket = new Socket(options);
  return socket.started;
}

export function isFree(name = pkg.name) {
  return !getConfig(name);
}

export function stop(options = defaultOptions) {
  if (!options.socket) return null;
  if (!socket) socket = new Socket(options);
  return socket.stop();
}

export default state.config;
