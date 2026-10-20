"use client";

import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Search discussions...", 
  className 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");

  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      
      // Reset to page 1 when search changes
      params.delete("page");
      
      router.push(`/community?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateSearchParams(searchTerm);
  }, [searchTerm, updateSearchParams]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    updateSearchParams("");
  }, [updateSearchParams]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label="Effacer la recherche"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>
      
      <Button onClick={handleSearch} size="sm">
        Search
      </Button>
    </div>
  );
}