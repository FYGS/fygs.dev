"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function TagsHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Gestion des tags</h1>
        <p className="text-muted-foreground">
          Organisez vos formations avec des tags personnalisés
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <Button asChild>
          <Link href="/admin/tags/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau tag
          </Link>
        </Button>
      </div>
    </div>
  );
}