import { create } from "zustand";

export interface Command {
  id: string;
  title: string;
  category: string;
  shortcut?: string[];
  keywords?: string[];
  action: () => void;
}

interface CommandStore {
  commands: Command[];
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  searchCommands: (query: string) => Command[];
}

export const useCommandStore = create<CommandStore>((set, get) => ({
  commands: [],
  registerCommand: (command) =>
    set((state) => {
      const exists = state.commands.some((cmd) => cmd.id === command.id);
      if (exists) return state;

      return {
        commands: [...state.commands, command],
      };
    }),
  unregisterCommand: (id) =>
    set((state) => ({
      commands: state.commands.filter((cmd) => cmd.id !== id),
    })),
  searchCommands: (query) => {
    const commands = get().commands;
    if (!query) return commands;

    const searchTerms = query.toLowerCase().split(" ");
    return commands.filter((command) => {
      const searchableText = [
        command.title.toLowerCase(),
        command.category.toLowerCase(),
        ...(command.keywords || []).map((k) => k.toLowerCase()),
      ].join(" ");

      return searchTerms.every((term) => searchableText.includes(term));
    });
  },
}));
