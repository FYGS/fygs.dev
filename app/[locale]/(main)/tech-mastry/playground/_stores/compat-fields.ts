import type { StateCreator, StoreMutatorIdentifier } from "zustand";

import type { PlaygroundStore } from "../_types";

type CompatSource = Pick<PlaygroundStore, "files" | "activeFileId" | "consoleEntries">;
type CompatFields = Pick<
  PlaygroundStore,
  "code" | "language" | "output" | "logs" | "errors"
>;

/**
 * The read-only fields kept for backward compatibility (`code`, `language`,
 * `output`, `logs`, `errors`), derived from the files and the console.
 */
export function deriveCompatFields({
  files,
  activeFileId,
  consoleEntries,
}: CompatSource): CompatFields {
  const file = files.find((f) => f.id === activeFileId);
  return {
    code: file?.content ?? "",
    language: file?.language ?? "typescript",
    output: consoleEntries
      .filter((e) => e.type === "result")
      .map((e) => e.content)
      .join("\n"),
    logs: consoleEntries
      .filter((e) => e.type !== "error" && e.type !== "result")
      .map((e) => e.content),
    errors: consoleEntries.filter((e) => e.type === "error").map((e) => e.content),
  };
}

const dependsOnSame = (a: CompatSource, b: CompatSource) =>
  a.files === b.files &&
  a.activeFileId === b.activeFileId &&
  a.consoleEntries === b.consoleEntries;

type Middleware = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<PlaygroundStore, Mps, Mcs>,
) => StateCreator<PlaygroundStore, Mps, Mcs>;

/**
 * Store middleware (outermost) that keeps the compatibility fields in step with
 * the state they derive from. As plain getters on the state object they went
 * stale at the first update (`setState` copies the properties it merges), and
 * did not follow a rehydration either; here every update, including the ones
 * made through `store.setState` and the persist middleware, recomputes them.
 */
export const withCompatFields: Middleware = (initializer) => (set, get, api) => {
  const setWithCompat = ((partial: unknown, replace?: boolean) =>
    (set as (updater: unknown, replace?: boolean) => void)((state: PlaygroundStore) => {
      const next = (
        typeof partial === "function" ? (partial as (s: PlaygroundStore) => unknown)(state) : partial
      ) as Partial<PlaygroundStore>;
      const merged = (replace ? next : { ...state, ...next }) as PlaygroundStore;
      return state && dependsOnSame(state, merged) ? next : { ...next, ...deriveCompatFields(merged) };
    }, replace)) as typeof set;

  api.setState = setWithCompat;
  const initial = initializer(setWithCompat, get, api);
  return { ...initial, ...deriveCompatFields(initial) };
};
