"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, RefObject } from "react";
import { SearchResult, highlightText, searchTopics } from "../_utils/search";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search query to avoid excessive searches while typing
  const debouncedQuery = useDebounce(query, 300);

  // Close search results when clicking outside
  useOnClickOutside(searchRef as RefObject<HTMLElement>, () => setIsOpen(false));

  // Perform search when debounced query changes (state adjusted during render,
  // see https://react.dev/learn/you-might-not-need-an-effect)
  const [searchedQuery, setSearchedQuery] = useState(debouncedQuery);
  if (searchedQuery !== debouncedQuery) {
    setSearchedQuery(debouncedQuery);
    if (debouncedQuery.trim() === "") {
      setResults([]);
    } else {
      setResults(searchTopics(debouncedQuery));
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  }

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      router.push(result.href);
      setQuery("");
      setResults([]);
      setIsOpen(false);
    },
    [router]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        // Global shortcuts when dropdown is closed
        if (
          e.key === "/" ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
        return;
      }

      // Shortcuts when dropdown is open
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (results.length > 0) {
            setSelectedIndex((prev) => (prev + 1) % results.length);
            // Scroll to selected item
            if (resultsRef.current) {
              const items =
                resultsRef.current.querySelectorAll('[role="option"]');
              const nextIndex = (selectedIndex + 1) % results.length;
              items[nextIndex]?.scrollIntoView({ block: "nearest" });
            }
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (results.length > 0) {
            const newIndex =
              selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
            setSelectedIndex(newIndex);
            // Scroll to selected item
            if (resultsRef.current) {
              const items =
                resultsRef.current.querySelectorAll('[role="option"]');
              items[newIndex]?.scrollIntoView({ block: "nearest" });
            }
          }
          break;

        case "Enter":
          if (selectedIndex >= 0 && results[selectedIndex]) {
            e.preventDefault();
            handleResultClick(results[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
          <Search className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          className="pl-10 pr-28 py-6 bg-background border-muted/80 rounded-xl shadow-xs transition-all duration-200
                     focus-visible:shadow-md focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20
                     group-hover:border-muted-foreground/30 text-base"
          onFocus={() => query.trim() !== "" && setIsOpen(true)}
          aria-label="Search input (Ctrl+K or / to focus)"
          onClick={() => inputRef.current?.focus()}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query.trim() !== "" && (
            <button
              onClick={handleClearSearch}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-1">
            <kbd className="hidden md:inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-muted-foreground bg-muted rounded border border-border">
              <span>/</span>
            </kbd>
            <kbd className="hidden md:inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-medium text-muted-foreground bg-muted rounded border border-border">
              <span>⌘K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute search-dropdown z-99999 top-full mt-3 w-full md:w-[min(calc(100%+4rem),36rem)] left-0 md:left-[max(0px,calc(50% - 18rem))] bg-background/95 backdrop-blur-xs border rounded-xl shadow-xl max-h-[70vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 isolate origin-top"
          role="listbox"
          style={{
            pointerEvents: "auto",
          }}
        >
          <div className="sticky top-0 z-10 p-3 text-xs font-medium text-muted-foreground bg-background/95 backdrop-blur-xs border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                {results.length}
              </span>
              <span>
                résultat{results.length > 1 ? "s" : ""} trouvé
                {results.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">
                ↑↓
              </kbd>
              <span>pour naviguer</span>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-8rem)] scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30 scrollbar-track-transparent scrollbar-thumb-rounded-full">
            {results.map((result, index) => (
              <div
                key={`${result.href}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex flex-col gap-2 px-5 py-4 rounded-lg cursor-pointer transition-all duration-150 my-1.5 mx-2",
                  index === selectedIndex
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md",
                        index === selectedIndex ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <result.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium break-words line-clamp-1 max-w-[200px] md:max-w-[250px]">
                      {highlightText(result.title, query)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.badge && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {result.badge}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        index === selectedIndex ? "default" : "secondary"
                      }
                      className="text-xs font-normal transition-colors duration-150"
                    >
                      {result.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 pl-10 leading-relaxed break-words pr-2">
                  {highlightText(
                    result.description || "Aucune description disponible",
                    query
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 z-10 p-3 text-xs bg-background/95 backdrop-blur-xs border-t flex items-center justify-between">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">
                Esc
              </kbd>
              <span>pour fermer</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">
                ↵
              </kbd>
              <span>pour sélectionner</span>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() !== "" && results.length === 0 && (
        <div
          className="absolute z-99999 top-full mt-3 w-full md:w-[min(calc(100%+4rem),36rem)] left-0 md:left-[max(0px,calc(50% - 18rem))] bg-background/95 backdrop-blur-xs border rounded-xl shadow-xl p-6 text-center animate-in fade-in-0 zoom-in-95 duration-200 isolate origin-top"
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Aucun résultat trouvé pour &quot;{query}&quot;. Essayez avec
              d&apos;autres termes ou vérifiez l&apos;orthographe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
