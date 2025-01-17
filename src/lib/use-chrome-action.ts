import { queryOptions, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useEvent } from './use-event';

export function useChromeAction(actionName: string, handler: () => void, subscribeToAction = true) {
  const handlerEvent = useEvent(handler);
  useEffect(() => {
    if (!subscribeToAction) return;

    const listener = (command: string) => {
      if (command === actionName) {
        handlerEvent();
      }
    };

    chrome.commands.onCommand.addListener(listener);
    return () => {
      chrome.commands.onCommand.removeListener(listener);
    };
  }, [actionName, subscribeToAction, handlerEvent]);
}

export const chromeActionQuery = queryOptions({
  queryKey: ['chrome-action'],
  queryFn: () => chrome.commands.getAll(),
});

export function useChromeActionInfoQuery(actionName: string) {
  return useQuery({
    ...chromeActionQuery,
    select: (x) => x.find((y) => y.name === actionName) ?? null,
  });
}
