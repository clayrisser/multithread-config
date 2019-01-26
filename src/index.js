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
const state = new State();
let socket = null;

export const configs = {};

export function setConfig(config = {}, options = defaultOptions) {
  const { name } = options;
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
  if (isFree(options)) configs[name] = state.config;
  return state.config;
}

export function getConfig(options = defaultOptions) {
  const { name } = options;
  if (options.socket && !socket) socket = new Socket(options);
  let config = null;
  if (configs[name]) {
    config = configs[name];
  } else if (socket) {
    try {
      config = socket.getConfig(options);
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

export function isFree(options = defaultOptions) {
  return !getConfig(options);
}

export function stop(options = defaultOptions) {
  if (!options.socket) return null;
  if (!socket) socket = new Socket(options);
  return socket.stop();
}

export default state.config;
