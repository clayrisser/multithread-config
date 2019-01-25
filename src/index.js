import mergeConfiguration from 'merge-configuration';
import Socket from './socket';
import State from './state';

const socket = new Socket();
const state = new State();

export const configs = {};

export function setConfig(name, config) {
  if (!socket.alive) socket.start();
  if (!isOwner()) {
    throw new Error('process is not the owner of config');
  }
  state.config = mergeConfiguration(state.config, config);
  if (isFree(name)) configs[name] = state.config;
  return state.config;
}

export function getConfig(name) {
  let config = null;
  if (configs[name]) {
    config = configs[name];
  } else {
    try {
      config = socket.getConfig(name);
    } catch (err) {}
  }
  if (!isOwner()) stop();
  return config;
}

export function isOwner() {
  return socket.started;
}

export function isFree(name) {
  return !getConfig(name);
}

export function stop() {
  socket.stop();
}

export default state.config;
