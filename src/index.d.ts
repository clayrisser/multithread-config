declare module 'multithread-config' {
  namespace MultithreadConfig {
    export interface Config {
      [key: string]: any;
    }

    export interface Options {
      socket?: boolean;
      timeout?: number;
      name?: string;
    }
  }

  class MultithreadConfig<TConfig = MultithreadConfig.Config> {
    constructor(options?: MultithreadConfig.Options);

    isMaster: () => boolean;

    setConfig<Config = TConfig>(config: Config): Promise<Config>;

    setConfigSync<Config = TConfig>(config: Config): Config;

    getConfig<Config = TConfig>(): Promise<Config>;

    getConfigSync<Config = TConfig>(): Config;

    start(): Promise<void>;

    startSync(): void;

    finish(): Promise<void>;

    finishSync(): void;

    preProcess<Config = TConfig>(config: Config): Config | Promise<Config>;

    postProcess<Config = TConfig>(config: Config): Config | Promise<Config>;
  }

  export = MultithreadConfig;
}
