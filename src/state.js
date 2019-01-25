const state = {
  config: {}
};

export default class State {
  constructor(options) {
    this.options = {
      ...options
    };
  }

  set config(config) {
    Object.assign(state.config, config);
    return state.config;
  }

  get config() {
    return state.config;
  }
}
