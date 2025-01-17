import type { Snapshot } from './snapshot';

export async function waitUntilTabLoaded(targetTabId: number) {
  return new Promise<void>((resolve) => {
    const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (tabId !== targetTabId || changeInfo.status !== 'complete') {
        return;
      }

      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

export async function preloadTab(tabId: number) {
  const tab = await chrome.tabs.get(tabId);

  if (tab.status === 'complete') {
    return tabId;
  }

  const loadPromise = waitUntilTabLoaded(tabId);

  if (tab.status === 'unloaded' || tab.discarded) {
    await chrome.tabs.reload(tabId);
  }

  await loadPromise;

  return tabId;
}

export async function getCurrentTab() {
  const [currentTab] = await chrome.tabs.query({ currentWindow: true, active: true });
  if (!currentTab.id) return null;
  return currentTab;
}

export async function getNextLoadedTabId() {
  return Promise.race(await getNextPreloadedTabs(5));
}

export async function getNextPreloadedTabs(tabsToPreload: number) {
  if (tabsToPreload <= 0) {
    return [];
  }

  const tabs = await chrome.tabs.query({
    currentWindow: true,
    windowType: 'normal',
    highlighted: false,
    active: false,
  });

  const loadedTabIds: number[] = [];
  const unloadedTabIds: number[] = [];

  for (const tab of tabs) {
    if (tab.status === 'complete') {
      loadedTabIds.push(tab.id!);
    } else {
      unloadedTabIds.push(tab.id!);
    }
  }

  const loadPromises: Promise<number>[] = [];

  for (const tabId of loadedTabIds) {
    loadPromises.push(Promise.resolve(tabId));

    if (loadPromises.length >= tabsToPreload) {
      return loadPromises;
    }
  }

  for (const tabId of unloadedTabIds) {
    loadPromises.push(preloadTab(tabId));

    if (loadPromises.length >= tabsToPreload) {
      return loadPromises;
    }
  }

  return loadPromises;
}

export async function getTabStats() {
  const tabs = await chrome.tabs.query({ windowType: 'normal' });

  const totalTabsCount = tabs.length;

  let loadedTabsCount = 0;
  let unloadedTabsCount = 0;
  const domains = new Map<string, number>();
  const windowIds = new Set<number>();

  for (const tab of tabs) {
    if (tab.status === 'complete') {
      loadedTabsCount++;
    } else {
      unloadedTabsCount++;
    }

    const domain = new URL(tab.url!).hostname;
    domains.set(domain, (domains.get(domain) || 0) + 1);

    windowIds.add(tab.windowId);
  }

  const topDomains = Array.from(domains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return {
    totalTabsCount,
    loadedTabsCount,
    unloadedTabsCount,
    topDomains,
    windowsCount: windowIds.size,
  };
}

export async function applyTabSnapshot(snapshot: Snapshot) {
  await chrome.windows.create({
    focused: true,
    url: snapshot.tabs,
  });
}
