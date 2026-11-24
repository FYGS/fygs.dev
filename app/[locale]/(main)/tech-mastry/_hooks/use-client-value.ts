import { useRef, useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * A value that can only be computed on the client (it draws random numbers or
 * reads the clock): `null` on the server and while hydrating, so that the
 * server markup and the first client render agree, then the value, computed
 * once, on every render after that. When the component is not hydrated (client
 * navigation, tests) the value is there from the first render.
 *
 * Replaces `useEffect(() => setValue(create()), [])`, which renders an empty
 * frame and sets state inside an effect.
 */
export function useClientValue<T>(create: () => T): T | null {
  const cache = useRef<{ value: T } | null>(null);
  return useSyncExternalStore(
    subscribe,
    () => {
      if (cache.current === null) cache.current = { value: create() };
      return cache.current.value;
    },
    () => null,
  );
}
