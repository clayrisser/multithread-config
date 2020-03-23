declare module 'multithread-config' {
  interface Config {
    [key: string]: any;
  }

  interface Options {
    forceKill?: boolean;
    name?: string;
    socket?: boolean;
    timeout?: number;
    watch?: boolean;
  }

  class MultithreadConfig<TConfig = Config> {
    constructor(options?: Options);

    isMaster: () => boolean;

    isStarted: boolean;

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
