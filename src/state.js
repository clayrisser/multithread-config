const state = {
  config: {}
};

export default class State {
  set config(config) {
    Object.assign(state.config, config);
    return state.config;
  }

  get config() {
    return state.config;
  }
}
