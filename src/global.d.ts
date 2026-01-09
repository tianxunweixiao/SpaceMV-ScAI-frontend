import { KeepTrack } from './keeptrack';

declare global {
  interface Window {
    keepTrack: KeepTrack;
    zaraz?: {
      consent?: {
        get: (key: string) => boolean;
        modal: boolean;
      };
    };
  }

  interface ImportMetaEnv {
    TIANXUN_SERVER_SETTINGS: string;
    [key: string]: string | undefined;
  }

  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

declare module 'clean-terminal-webpack-plugin';

export { };

