import { Button } from "@/components/ui/button";
import type { CacheState } from "./types";

export function CachingStrategyBar({
  cache,
  changeStrategy,
  toggleCache,
}: {
  cache: CacheState;
  changeStrategy: (strategy: CacheState["strategy"]) => void;
  toggleCache: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={cache.strategy === "lru" ? "default" : "outline"}
        size="sm"
        onClick={() => changeStrategy("lru")}
        className={
          cache.strategy === "lru"
            ? "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md shadow-indigo-500/20"
            : "border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
        LRU (Least Recently Used)
      </Button>
      <Button
        variant={cache.strategy === "fifo" ? "default" : "outline"}
        size="sm"
        onClick={() => changeStrategy("fifo")}
        className={
          cache.strategy === "fifo"
            ? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md shadow-purple-500/20"
            : "border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 hover:text-purple-800 dark:hover:text-purple-300 transition-all duration-300"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        FIFO (First In First Out)
      </Button>
      <Button
        variant={cache.strategy === "random" ? "default" : "outline"}
        size="sm"
        onClick={() => changeStrategy("random")}
        className={
          cache.strategy === "random"
            ? "bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-md shadow-blue-500/20"
            : "border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-300"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M16 21.9V16a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2V5.1" />
          <path d="M16 16.9V10a2 2 0 0 0-2-2H9.1" />
          <path d="M3 3h.1" />
          <path d="M7 3h.1" />
          <path d="M11 3h.1" />
          <path d="M15 3h.1" />
          <path d="M19 3h.1" />
          <path d="M19 7h.1" />
          <path d="M19 11h.1" />
          <path d="M19 15h.1" />
          <path d="M19 19h.1" />
          <path d="M15 19h.1" />
          <path d="M11 19h.1" />
          <path d="M7 19h.1" />
          <path d="M3 19h.1" />
          <path d="M3 15h.1" />
          <path d="M3 11h.1" />
          <path d="M3 7h.1" />
        </svg>
        Random Replacement
      </Button>

      <div className="ml-auto">
        <Button
          variant={cache.enabled ? "default" : "outline"}
          size="sm"
          onClick={toggleCache}
          className={
            cache.enabled
              ? "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
              : "border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-500/10 hover:text-red-800 dark:hover:text-red-300 transition-all duration-300"
          }
        >
          {cache.enabled ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>{" "}
              Cache Activé
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>{" "}
              Cache Désactivé
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
