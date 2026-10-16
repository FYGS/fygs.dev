import type { StoreApi } from "zustand";

import type { PlaygroundStore } from "../../_types";

export type PlaygroundSet = StoreApi<PlaygroundStore>["setState"];
export type PlaygroundGet = StoreApi<PlaygroundStore>["getState"];
