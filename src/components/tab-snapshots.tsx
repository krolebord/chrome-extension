import { cn } from '@/lib/cn';
import { type Snapshot, maxSnapshots, snapshotsStorageKey, snapshotsStore } from '@/lib/snapshot';
import { storageQueryKey } from '@/lib/storage';
import { applyTabSnapshot } from '@/lib/tab';
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CheckIcon, Edit2Icon, ExternalLinkIcon, TrashIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { SimpleTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const tabSnapshotsQuery = queryOptions({
  queryKey: [storageQueryKey, snapshotsStorageKey],
  queryFn: snapshotsStore.loadAll,
  placeholderData: keepPreviousData,
});

const windowTabsQuery = queryOptions({
  queryKey: ['window-tabs'],
  queryFn: () => {
    return chrome.tabs.query({ currentWindow: true });
  },
  placeholderData: keepPreviousData,
});

export function TabSnapshots() {
  const queryClient = useQueryClient();

  const snapshots = useQuery(tabSnapshotsQuery);
  const windowTabs = useQuery(windowTabsQuery);

  const saveWindowSnapshotMutation = useMutation({
    mutationKey: ['save-window-snapshot'],
    mutationFn: async () => {
      await snapshotsStore.saveFromCurrentWindow();
    },
  });

  return (
    <div className="flex flex-col gap-2 text-white text-sm">
      <p className="text-sm">
        Snapshots{' '}
        {!!snapshots.data?.length && (
          <span>
            ({snapshots.data.length} / {maxSnapshots})
          </span>
        )}
      </p>
      <Button
        className="w-full"
        delayedDisabled={saveWindowSnapshotMutation.isPending}
        onClick={() => saveWindowSnapshotMutation.mutate()}
      >{`Save window snapshot (${windowTabs.data?.length} tabs)`}</Button>
      {snapshots.data?.map((snapshot) => (
        <SnapshotCard key={snapshot.id} snapshot={snapshot} />
      ))}
    </div>
  );
}

type SnapshotCardProps = {
  snapshot: Snapshot;
};
function SnapshotCard(props: SnapshotCardProps) {
  const { snapshot } = props;

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const [name, setName] = useState(snapshot.name);

  const [isDeleted, setIsDeleted] = useState(false);
  const deleteSnapshotMutation = useMutation({
    mutationKey: ['delete-snapshot'],
    mutationFn: async () => {
      setIsDeleted(true);
      await snapshotsStore.delete(snapshot.id);
    },
  });

  const updateSnapshotMutation = useMutation({
    mutationKey: ['update-snapshot'],
    mutationFn: async () => {
      await snapshotsStore.update({
        ...snapshot,
        name,
      });
    },
  });

  const applySnapshotMutation = useMutation({
    mutationKey: ['apply-snapshot'],
    mutationFn: async () => {
      await applyTabSnapshot(snapshot);
    },
  });

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto_auto] content-center items-center gap-2 py-1 h-9',
        isDeleted && 'opacity-75 pointer-events-none',
      )}
    >
      <SimpleTooltip content="Apply snapshot">
        <button type="button" onClick={() => applySnapshotMutation.mutate()}>
          <ExternalLinkIcon size={20} />
        </button>
      </SimpleTooltip>
      {mode === 'edit' ? (
        <input
          type="text"
          className="px-1 py-1"
          // biome-ignore lint/a11y/noAutofocus: <explanation>
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.select();
          }}
        />
      ) : (
        <p className="text-nowrap overflow-ellipsis  overflow-hidden">{name}</p>
      )}
      {mode === 'view' && (
        <SimpleTooltip content="Edit name">
          <button type="button" onClick={() => setMode('edit')}>
            <Edit2Icon size={20} />
          </button>
        </SimpleTooltip>
      )}
      {mode === 'view' && (
        <SimpleTooltip content="Delete">
          <button type="button" onClick={() => deleteSnapshotMutation.mutate()}>
            <TrashIcon size={20} />
          </button>
        </SimpleTooltip>
      )}
      {mode === 'edit' && (
        <SimpleTooltip content="Confirm">
          <button
            type="button"
            onClick={() => {
              updateSnapshotMutation.mutate();
              setMode('view');
            }}
          >
            <CheckIcon size={20} />
          </button>
        </SimpleTooltip>
      )}
      {mode === 'edit' && (
        <SimpleTooltip content="Cancel">
          <button type="button" onClick={() => setMode('view')}>
            <XIcon size={20} />
          </button>
        </SimpleTooltip>
      )}
    </div>
  );
}
