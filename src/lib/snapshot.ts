import { format } from 'date-fns';
import { z } from 'zod';
import { storage } from './storage';
import { filteredArraySchema } from './zod';

export const maxSnapshots = 10;
export const snapshotsStorageKey = 'tab-snapshots';

export const snapshotKey = (id: string) => `${snapshotsStorageKey}:${id}`;

const snapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  tabs: z.array(z.string()),
});

export type Snapshot = z.infer<typeof snapshotSchema>;

export const snapshotsStore = {
  loadAll: loadValidSnapshots,
  saveFromCurrentWindow: saveSnapshotFromCurrentWindowTabs,
  delete: deleteSnapshot,
  update: updateSnapshot,
};

const snapshotsSection = storage.createTypedSection(
  snapshotsStorageKey,
  filteredArraySchema(z.string()),
);

async function loadValidSnapshots() {
  const snapshotIds = await snapshotsSection.get([]);
  const snapshots = await storage.getValidated(snapshotIds.map(snapshotKey), snapshotSchema);

  return snapshots;
}

async function createSnapshotFromCurrentWindowTabs() {
  const windowTabs = await chrome.tabs.query({ currentWindow: true });
  const snapshot = {
    id: crypto.randomUUID(),
    name: `Window snapshot (${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')})`,
    tabs: windowTabs.filter((tab) => tab.url).map((tab) => tab.url),
  } as Snapshot;

  return snapshot;
}

async function saveSnapshot(snapshot: Snapshot) {
  const snapshots = await loadValidSnapshots();
  if (snapshots.length >= maxSnapshots) {
    console.warn('Max snapshots reached');
    return;
  }

  const newSnapshots = [snapshot, ...snapshots];
  await setSnapshots(newSnapshots);
}

async function saveSnapshotFromCurrentWindowTabs() {
  const snapshot = await createSnapshotFromCurrentWindowTabs();
  await saveSnapshot(snapshot);
}

async function setSnapshots(snapshots: Snapshot[]) {
  const ids = snapshots.map((snapshot) => snapshot.id);
  const values = Object.fromEntries(
    snapshots.map((snapshot) => [snapshotKey(snapshot.id), snapshot]),
  );

  await storage.set({
    [snapshotsStorageKey]: ids,
    ...values,
  });
}

async function deleteSnapshot(snapshotId: string) {
  await storage.remove(snapshotKey(snapshotId));
}

async function updateSnapshot(snapshot: Snapshot) {
  await storage.set({ [snapshotKey(snapshot.id)]: snapshot });
}
