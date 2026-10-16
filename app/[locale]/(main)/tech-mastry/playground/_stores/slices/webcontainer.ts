import {
  getWebContainer,
  isWebContainerSupported,
  onWebContainerEvent,
  installDependencies as wcInstallDeps,
  mountFiles as wcMountFiles,
} from "@/app/_lib/webcontainer-executor";
import type {
  PlaygroundStore,
} from "../../_types";
import type { PlaygroundGet, PlaygroundSet } from "./types";

/** WebContainer boot and dependency installation actions. */
export const createWebContainerSlice = (
  set: PlaygroundSet,
  get: PlaygroundGet,
): Pick<
  PlaygroundStore,
  | "bootWebContainer"
  | "setServerUrl"
  | "setWcStatus"
  | "installPackages"
> => ({
  // ── WebContainer Actions ──
  bootWebContainer: async () => {
    if (!isWebContainerSupported()) return;

    try {
      set({ wcStatus: "booting" });
      get().addConsoleEntry({
        type: "info",
        content: "Booting WebContainer (real Node.js runtime)...",
      });

      await getWebContainer();
      set({ wcStatus: "ready" });
      get().addConsoleEntry({
        type: "info",
        content: "✅ WebContainer ready — real Node.js environment active",
      });
    } catch (error) {
      set({ wcStatus: "error" });
      get().addConsoleEntry({
        type: "error",
        content: `WebContainer boot failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },

  setServerUrl: (url) => set({ serverUrl: url }),

  setWcStatus: (status) => set({ wcStatus: status }),

  installPackages: async () => {
    if (!isWebContainerSupported()) {
      get().addConsoleEntry({
        type: "error",
        content: "WebContainer not available — cannot install packages",
      });
      return;
    }

    try {
      set({ wcStatus: "installing" });
      get().addConsoleEntry({
        type: "info",
        content: "Installing dependencies with npm...",
      });

      // Mount current files first
      const { files } = get();
      const fileMap: Record<string, string> = {};
      files.forEach((f) => {
        fileMap[f.path] = f.content;
      });
      await wcMountFiles(fileMap);

      // Subscribe to events for live streaming during install
      const unsubscribe = onWebContainerEvent((event) => {
        if (event.type === "log" && event.message?.trim()) {
          get().addConsoleEntry({ type: "log", content: event.message });
        } else if (event.type === "error" && event.message?.trim()) {
          get().addConsoleEntry({ type: "error", content: event.message });
        } else if (event.type === "status" && event.status) {
          set({ wcStatus: event.status });
        }
      });

      const result = await wcInstallDeps();
      unsubscribe();

      if (result.success) {
        set({ wcStatus: "ready" });
        get().addConsoleEntry({
          type: "info",
          content: "✅ Dependencies installed successfully",
        });
      } else {
        set({ wcStatus: "error" });
      }
    } catch (error) {
      set({ wcStatus: "error" });
      get().addConsoleEntry({
        type: "error",
        content: `Install failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  },
});
