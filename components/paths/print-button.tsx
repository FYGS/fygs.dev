"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens the print dialog: « Enregistrer au format PDF » gives the certificate as a file. */
export function PrintButton({ children = "Imprimer / enregistrer en PDF" }: { children?: React.ReactNode }) {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" aria-hidden />
      {children}
    </Button>
  );
}
