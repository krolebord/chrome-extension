import type Manifest from '@/manifest';

export type AppCommand = keyof (typeof Manifest)['commands'];

export const requestAppCommand = (command: AppCommand) => {
  return chrome.runtime.sendMessage({ command });
};
