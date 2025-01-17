import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/main/tailwind.css';
import { DefaultQueryProvider } from '@/components/default-query-provider';
import { KeyEmitter } from '@/components/key-emitter';
import { TooltipProvider } from '@/components/tooltip';
import { SidePanelApp } from './side-panel-app';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <DefaultQueryProvider>
      <TooltipProvider>
        <SidePanelApp />
      </TooltipProvider>
    </DefaultQueryProvider>
    <KeyEmitter />
  </React.StrictMode>,
);
