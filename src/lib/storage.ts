import type { z } from 'zod';

export const storageQueryKey = 'storage';

export const storage = createStorage(chrome.storage.sync);

function createStorage(base: chrome.storage.SyncStorageArea) {
  function createTypedSection<TSchema extends z.ZodTypeAny>(key: string, schema: TSchema) {
    return createTypedStorageSection(base, key, schema);
  }

  async function getValidated<TSchema extends z.ZodTypeAny, TDefault>(
    keys: string[],
    schema: TSchema,
  ) {
    const results = [] as z.infer<TSchema>[];
    const values = await base.get(keys);

    for (const key of keys) {
      const value = values[key];
      const parsed = schema.safeParse(value);
      if (parsed.success) {
        results.push(parsed.data);
      }
    }

    return results;
  }

  const additionalFunction = { createTypedSection, getValidated };

  Object.assign(base, additionalFunction);

  return base as typeof base & typeof additionalFunction;
}

function createTypedStorageSection<TSchema extends z.ZodTypeAny>(
  base: chrome.storage.SyncStorageArea,
  key: string,
  schema: TSchema,
) {
  async function set(value: z.infer<TSchema>) {
    await base.set({ [key]: value });
  }

  async function get<TDefault>(defaultValue: TDefault): Promise<z.infer<TSchema> | TDefault> {
    const { [key]: raw } = await base.get(key);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return defaultValue;
    }

    return parsed.data;
  }

  async function clean() {
    await base.remove(key);
  }

  return { set, get, clean };
}
