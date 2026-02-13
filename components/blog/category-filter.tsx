"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useLocale } from "next-intlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: string[];
  selected?: string;
}

export function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();

  const allLabel =
    locale === "fr"
      ? "Toutes les catégories"
      : locale === "es"
        ? "Todas las categorías"
        : "All Categories";

  const handleSelect = (category: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset pagination when changing category
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selected || allLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuItem onClick={() => handleSelect(null)}>
          <span className="flex items-center">
            {!selected && <CheckIcon className="mr-2 h-4 w-4" />}
            <span className={cn(!selected && "font-medium")}>{allLabel}</span>
          </span>
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() => handleSelect(category)}
          >
            <span className="flex items-center">
              {selected === category && <CheckIcon className="mr-2 h-4 w-4" />}
              <span className={cn(selected === category && "font-medium")}>
                {category}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
