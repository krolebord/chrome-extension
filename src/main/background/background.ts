import type { AppCommand } from '@/app-command';
import { closeCurrentTabAndGetToNextTab, getToNextTab, mergeTabsIntoOneWindow } from './actions';

const registeredCommands = {
  'next-tab': getToNextTab,
  untab: closeCurrentTabAndGetToNextTab,
  'merge-tabs': mergeTabsIntoOneWindow,
} satisfies Record<AppCommand, () => Promise<void>>;

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.commands.onCommand.addListener(async (command) => {
  const handler = registeredCommands[command as AppCommand];

  if (!handler) {
    return;
  }

  await handler();
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (
    !sender.url?.endsWith('side-panel.html') ||
    !message.command ||
    typeof message.command !== 'string'
  ) {
    return;
  }

  const command = message.command as AppCommand;
  const handler = registeredCommands[command];
  if (!handler) {
    return;
  }

  await handler();
});
