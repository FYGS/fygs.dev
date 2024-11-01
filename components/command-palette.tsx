"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Command as CommandType, useCommandStore } from "@/lib/command-store";
import { cn } from "@/lib/utils";
import { Command as CommandIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function CommandShortcutHint({ shortcut }: { shortcut?: string[] }) {
  if (!shortcut?.length) return null;

  return (
    <CommandShortcut>
      {shortcut.map((key, index) => (
        <span key={key}>
          <kbd
            className={cn(
              "px-1.5 py-0.5 text-xs font-semibold",
              "bg-muted rounded border border-border",
              "inline-flex items-center justify-center min-w-[20px]"
            )}
          >
            {key}
          </kbd>
          {index < shortcut.length - 1 && <span className="mx-1">+</span>}
        </span>
      ))}
    </CommandShortcut>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { commands, searchCommands } = useCommandStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCommands = useMemo(() => {
    return searchCommands(searchTerm);
  }, [searchCommands, searchTerm]);

  const commandsByCategory = useMemo(() => {
    return filteredCommands.reduce<Record<string, CommandType[]>>(
      (acc, command) => {
        if (!acc[command.category]) {
          acc[command.category] = [];
        }
        acc[command.category].push(command);
        return acc;
      },
      {}
    );
  }, [filteredCommands]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSelect = useCallback((command: CommandType) => {
    command.action();
    setOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <CommandIcon className="size-4" />
      </Button>

      {open && (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command shouldFilter={false} className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Type a command or search..."
              value={searchTerm}
              onValueChange={handleSearch}
            />
            <CommandList>
              <CommandEmpty>No commands found.</CommandEmpty>
              {Object.entries(commandsByCategory).map(
                ([category, categoryCommands], index, array) => (
                  <div key={category}>
                    <CommandGroup heading={category}>
                      {categoryCommands.map((command) => (
                        <CommandItem
                          key={command.id}
                          onSelect={() => handleSelect(command)}
                        >
                          {command.title}
                          <CommandShortcutHint shortcut={command.shortcut} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {index < array.length - 1 && <CommandSeparator />}
                  </div>
                )
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      )}
    </>
  );
}
