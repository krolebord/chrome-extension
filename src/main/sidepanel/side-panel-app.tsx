import { type AppCommand, requestAppCommand } from '@/app-command';
import { Button, ChromeCommandButton, ShortcutButton } from '@/components/button';
import { Separator } from '@/components/divider';
import { TabSnapshots } from '@/components/tab-snapshots';
import { getTabStats } from '@/lib/tab';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

const useCommandMutation = (commandName: AppCommand) => {
  return useMutation({
    mutationFn: async () => {
      await requestAppCommand(commandName);
    },
  });
};

export const SidePanelApp = () => {
  const goToNextTabMutation = useCommandMutation('next-tab');
  const closeCurrentTabMutation = useCommandMutation('untab');
  const mergeTabsMutation = useCommandMutation('merge-tabs');

  const isLoading =
    closeCurrentTabMutation.isPending ||
    goToNextTabMutation.isPending ||
    mergeTabsMutation.isPending;

  return (
    <main className="flex flex-col min-h-screen justify-between min-w-48 py-4 px-4 gap-2">
      <div className="flex flex-col items-stretch gap-2">
        <ChromeCommandButton
          className="min-w-44 w-full justify-between"
          commandName="untab"
          delayedDisabled={isLoading}
          subscribeToCommand={false}
          onClick={() => closeCurrentTabMutation.mutate()}
        >
          Untab
        </ChromeCommandButton>
        <ChromeCommandButton
          className="min-w-44 w-full justify-between"
          commandName="next-tab"
          delayedDisabled={isLoading}
          subscribeToCommand={false}
          onClick={() => goToNextTabMutation.mutate()}
        >
          Go to next tab
        </ChromeCommandButton>

        <div className="py-4">
          <Separator className="w-full" />
        </div>

        <ChromeCommandButton
          className="min-w-44 w-full justify-between"
          commandName="merge-tabs"
          delayedDisabled={isLoading}
          subscribeToCommand={false}
          onClick={() => mergeTabsMutation.mutate()}
        >
          Merge tabs into current window
        </ChromeCommandButton>

        <div className="py-4">
          <Separator className="w-full" />
        </div>

        <TabSnapshots />
      </div>

      <TabStats />
    </main>
  );
};

const tabStatsQuery = queryOptions({
  queryKey: ['tab-stats'],
  queryFn: async () => {
    const stats = await getTabStats();
    return stats;
  },
  refetchIntervalInBackground: false,
  refetchInterval: 1000,
});

function TabStats() {
  const { data } = useQuery(tabStatsQuery);

  return (
    <div className="text-gray-500 text-sm pt-2">
      <p>
        <span className="font-bold text-gray-400">{data?.totalTabsCount}</span> tabs (
        {data?.loadedTabsCount} loaded / {data?.unloadedTabsCount} unloaded){' '}
        {data?.windowsCount && data?.windowsCount > 1 ? `in ${data?.windowsCount} windows` : ''}
      </p>
      <div className="h-2" />
      <p>Top domains:</p>
      <ul className="list-disc pl-5">
        {data?.topDomains.map(([domain, count]) => (
          <li key={domain}>
            <span className="font-bold">{domain}</span> ({count})
          </li>
        ))}
      </ul>
    </div>
  );
}
