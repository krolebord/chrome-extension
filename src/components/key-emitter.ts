import { useEffect } from 'react';
import { useEvent } from '../lib/use-event';

const normalizedKeySymbol = Symbol('normalized-key');

type NormalizedKey = string & { [normalizedKeySymbol]: true };

export function buildNormalizedKey(keyInfo: KeyInfo): NormalizedKey {
  if (!keyInfo.modifiers || keyInfo.modifiers.length === 0) {
    return keyInfo.key.toLowerCase() as NormalizedKey;
  }

  return `${keyInfo.modifiers.toSorted().join('+')}+${keyInfo.key}`.toLowerCase() as NormalizedKey;
}

const keyEventToKeyInfo = (event: KeyboardEvent): KeyInfo => {
  const modifiers: ShortcutModifiers[] = [];
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');
  return {
    key: event.key,
    modifiers,
  };
};

const allowedModifiers = ['shift', 'ctrl', 'alt', 'meta'] as const;
export type ShortcutModifiers = (typeof allowedModifiers)[number];

type KeyInfo = {
  key: string;
  modifiers?: ShortcutModifiers[];
};

function getOrSetMapValue<K, V>(map: Map<K, V>, key: K, defaultValue: V) {
  const value = map.get(key);
  if (value) return value;
  map.set(key, defaultValue);
  return defaultValue;
}

class _KeyEmitter {
  private readonly listeners: Map<NormalizedKey, Set<(event: KeyboardEvent) => void>> = new Map();

  addListener(keyInfo: KeyInfo, listener: (event: KeyboardEvent) => void) {
    const listeners = getOrSetMapValue(this.listeners, buildNormalizedKey(keyInfo), new Set());
    listeners.add(listener);
  }

  removeListener(keyInfo: KeyInfo, listener: (event: KeyboardEvent) => void) {
    const listeners = getOrSetMapValue(this.listeners, buildNormalizedKey(keyInfo), new Set());
    listeners.delete(listener);
  }

  emit(event: KeyboardEvent): boolean {
    const listeners = this.listeners.get(buildNormalizedKey(keyEventToKeyInfo(event)));
    if (!listeners?.size) return false;
    for (const listener of listeners) {
      listener(event);
    }
    return true;
  }
}

const keyEmitter = new _KeyEmitter();

export function KeyEmitter() {
  const globalKeyHandler = useEvent((e: KeyboardEvent) => {
    const hasEmitted = keyEmitter.emit(e);
    if (hasEmitted) {
      e.preventDefault();
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', globalKeyHandler);
    return () => {
      document.removeEventListener('keydown', globalKeyHandler);
    };
  }, [globalKeyHandler]);

  return null;
}

export function useKeyEvent(keyInfo: KeyInfo, listener: (event: KeyboardEvent) => void) {
  const keyHandler = useEvent(listener);
  useEffect(() => {
    keyEmitter.addListener(keyInfo, keyHandler);
    return () => {
      keyEmitter.removeListener(keyInfo, keyHandler);
    };
  }, [keyInfo, keyHandler]);
}
