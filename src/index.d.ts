declare class MultithreadConfig<TConfig = Config> {
  isOwner: boolean;

  setConfig<Config = TConfig>(config: Config): Promise<Config>;

  getConfig<Config = TConfig>(): Promise<Config>;

  start(): Promise<void>;

  finish(): Promise<void>;

  preProcess<Config = TConfig>(config: Config): Config | Promise<Config>;

  postProcess<Config = TConfig>(config: Config): Config | Promise<Config>;
}

declare interface Config {
  [key: string]: any;
}

declare module 'multithread-config' {
  export = MultithreadConfig;
}
