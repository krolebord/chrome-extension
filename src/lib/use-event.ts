import React from 'react';

const useInsertionEffect =
  typeof window !== 'undefined' ? React.useInsertionEffect || React.useLayoutEffect : () => {};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useEvent<TCallback extends (...args: any[]) => any>(
  callback: TCallback,
): TCallback {
  const latestRef = React.useRef<TCallback | null>(null);
  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  const stableRef = React.useRef<TCallback | null>(null);
  if (!stableRef.current) {
    stableRef.current = function (this: unknown) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      // biome-ignore lint/style/noArguments: <explanation>
      return latestRef.current?.apply(this, arguments as any);
    } as TCallback;
  }

  return stableRef.current;
}
