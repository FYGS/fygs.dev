"use client";

import { useContextualCommands } from "@/hooks/use-contextual-commands";
import { useRouter } from "next/navigation";

export function ContextualCommandsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Commandes globales et contextuelles
  useContextualCommands([
    // Commandes de navigation globales
    {
      id: "navigation.home",
      title: "Go to Home",
      category: "Navigation",
      shortcut: ["G", "H"],
      keywords: ["home", "main", "index"],
      action: () => router.push("/"),
    },
    // ... autres commandes de navigation

    // Commandes contextuelles pour le blog
    {
      id: "blog.new-post",
      title: "Create New Post",
      category: "Blog",
      shortcut: ["N", "P"],
      keywords: ["blog", "post", "new", "create"],
      context: "/blog",
      action: () => router.push("/blog/new"),
    },
    {
      id: "blog.toggle-reading-mode",
      title: "Toggle Reading Mode",
      category: "Blog",
      shortcut: ["R", "M"],
      keywords: ["blog", "reading", "mode"],
      context: /^\/blog\/[^/]+$/,
      action: () => {
        document.documentElement.classList.toggle("reading-mode");
      },
    },

    // Commandes contextuelles pour les projets
    {
      id: "projects.filter-by-tech",
      title: "Filter Projects by Technology",
      category: "Projects",
      shortcut: ["F", "T"],
      keywords: ["projects", "filter", "technology"],
      context: "/projects",
      action: () => {
        // Logique de filtrage
      },
    },
    {
      id: "projects.sort-by-date",
      title: "Sort Projects by Date",
      category: "Projects",
      shortcut: ["S", "D"],
      keywords: ["projects", "sort", "date"],
      context: "/projects",
      action: () => {
        // Logique de tri
      },
    },

    // Commandes contextuelles pour le CV
    {
      id: "resume.download-pdf",
      title: "Download Resume as PDF",
      category: "Resume",
      shortcut: ["D", "R"],
      keywords: ["resume", "cv", "download", "pdf"],
      context: "/me",
      action: () => {
        window.open("/Fernand_SOUALO_Resume.pdf", "_blank");
      },
    },
    {
      id: "resume.copy-contact",
      title: "Copy Contact Information",
      category: "Resume",
      shortcut: ["C", "C"],
      keywords: ["resume", "contact", "copy"],
      context: "/me",
      action: () => {
        navigator.clipboard.writeText("fygs.dev@gmail.com");
      },
    },

    // Commandes contextuelles pour le formulaire de contact
    {
      id: "contact.clear-form",
      title: "Clear Contact Form",
      category: "Contact",
      shortcut: ["C", "F"],
      keywords: ["contact", "form", "clear"],
      context: "/contact",
      action: () => {
        // Logique de nettoyage du formulaire
      },
    },
    {
      id: "contact.fill-example",
      title: "Fill Form with Example",
      category: "Contact",
      shortcut: ["F", "E"],
      keywords: ["contact", "form", "example"],
      context: "/contact",
      action: () => {
        // Logique de remplissage d'exemple
      },
    },
  ]);

  return <>{children}</>;
}
