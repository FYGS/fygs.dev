"use client";

import { useCommandStore } from "@/lib/command-store";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface ContextualCommand {
  id: string;
  title: string;
  category: string;
  shortcut?: string[];
  keywords?: string[];
  action: () => void;
  context?: string | RegExp | (string | RegExp)[];
}

export function useContextualCommands(commands: ContextualCommand[]) {
  const pathname = usePathname();
  const { registerCommand, unregisterCommand } = useCommandStore();
  const registeredCommandsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Filtrer les commandes basées sur le contexte actuel
    const activeCommands = commands.filter((command) => {
      if (!command.context) return true;

      const contexts = Array.isArray(command.context)
        ? command.context
        : [command.context];

      return contexts.some((context) => {
        if (context instanceof RegExp) {
          return context.test(pathname);
        }
        return pathname === context;
      });
    });

    // Identifier les commandes à ajouter et à supprimer
    const currentCommandIds = new Set(activeCommands.map((cmd) => cmd.id));
    const commandsToRemove = Array.from(registeredCommandsRef.current).filter(
      (id) => !currentCommandIds.has(id)
    );
    const commandsToAdd = activeCommands.filter(
      (cmd) => !registeredCommandsRef.current.has(cmd.id)
    );

    // Supprimer les anciennes commandes
    commandsToRemove.forEach((id) => {
      unregisterCommand(id);
      registeredCommandsRef.current.delete(id);
    });

    // Ajouter les nouvelles commandes
    commandsToAdd.forEach(({ context, ...command }) => {
      registerCommand(command);
      registeredCommandsRef.current.add(command.id);
    });

    // Nettoyage lors du démontage
    return () => {
      registeredCommandsRef.current.forEach((id) => {
        unregisterCommand(id);
      });
      registeredCommandsRef.current.clear();
    };
  }, [commands, pathname, registerCommand, unregisterCommand]);
}
