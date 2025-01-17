import type { ManifestV3Export } from '@crxjs/vite-plugin';
import packageData from '../package.json';

//@ts-ignore
const isDev = process.env.NODE_ENV === 'development';

export default {
  name: `${packageData.displayName || packageData.name}${isDev ? ' ➡️ Dev' : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],

  permissions: ['tabs', 'sidePanel', 'storage'],

  action: {
    default_title: 'Click to open panel',
    default_icon: 'img/logo-48.png',
  },
  background: {
    service_worker: 'src/main/background/background.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/main/sidepanel/side-panel.html',
  },
  commands: {
    untab: {
      description: 'Close current tab',
      suggested_key: {
        default: 'Ctrl+X',
      },
    },
    'next-tab': {
      description: 'Go to next tab',
      suggested_key: {
        default: 'Ctrl+A',
      },
    },
    'merge-tabs': {
      description: 'Merge tabs into one window',
      suggested_key: {
        default: 'Ctrl+M',
      },
    },
  },
} satisfies ManifestV3Export;
