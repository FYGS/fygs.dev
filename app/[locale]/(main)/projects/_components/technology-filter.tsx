"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import { useCallback, useMemo } from "react";

interface TechnologyFilterProps {
  technologies: string[];
  selectedTechnologies: string[];
  onChange: (technologies: string[]) => void;
}

export function TechnologyFilter({
  technologies,
  selectedTechnologies,
  onChange,
}: TechnologyFilterProps) {
  const sortedTechnologies = useMemo(
    () => [...technologies].sort((a, b) => a.localeCompare(b)),
    [technologies]
  );

  const handleSelect = useCallback(
    (technology: string) => {
      if (selectedTechnologies.includes(technology)) {
        onChange(selectedTechnologies.filter((t) => t !== technology));
      } else {
        onChange([...selectedTechnologies, technology]);
      }
    },
    [selectedTechnologies, onChange]
  );

  const handleClear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleSelectAll = useCallback(() => {
    onChange(technologies);
  }, [onChange, technologies]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            selectedTechnologies.length > 0 && "border-primary"
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          {selectedTechnologies.length > 0 ? (
            <>
              {selectedTechnologies.length} selected
              <span className="sr-only">technologies</span>
            </>
          ) : (
            "Filter technologies"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Filter by Technology</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {sortedTechnologies.map((technology) => (
            <DropdownMenuCheckboxItem
              key={technology}
              checked={selectedTechnologies.includes(technology)}
              onCheckedChange={() => handleSelect(technology)}
            >
              {technology}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="flex justify-between p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={selectedTechnologies.length === 0}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedTechnologies.length === technologies.length}
          >
            Select All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
