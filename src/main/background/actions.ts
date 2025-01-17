import { getCurrentTab, getNextLoadedTabId } from '@/lib/tab';

export async function getToNextTab() {
  const nextTabId = await getNextLoadedTabId();
  await chrome.tabs.update(nextTabId, { highlighted: true, muted: true });
}

export async function closeCurrentTabAndGetToNextTab() {
  const [nextTab, currentTab] = await Promise.all([getNextLoadedTabId(), getCurrentTab()]);

  if (currentTab) {
    await chrome.tabs.remove(currentTab.id!);
  }

  await chrome.tabs.update(nextTab, { highlighted: true, muted: true });
}

export async function mergeTabsIntoOneWindow() {
  const targetWindow = await chrome.windows.getCurrent();
  const tabs = await chrome.tabs.query({ currentWindow: false, windowType: 'normal' });

  for (const tab of tabs) {
    await chrome.tabs.move(tab.id!, { windowId: targetWindow.id!, index: -1 });
  }
}
