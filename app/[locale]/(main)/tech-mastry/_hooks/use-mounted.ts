import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` on the server and during hydration, `true` on every client render
 * after that. Replaces the `useEffect(() => setMounted(true), [])` pattern.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
