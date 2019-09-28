declare class MultithreadConfig {
  isOwner: boolean;

  setConfig<TConfig = Config>(config: TConfig): Promise<TConfig>;

  getConfig<TConfig = Config>(): Promise<TConfig>;

  start(): Promise<void>;

  finish(): Promise<void>;

  preProcess<TConfig = Config>(): TConfig | Promise<TConfig>;

  postProcess<TConfig = Config>(): TConfig | Promise<TConfig>;
}

declare interface Config {
  [key: string]: any;
}

declare module 'multithread-config' {
  export = MultithreadConfig;
}
