"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: CourseCategory.JAVASCRIPT, label: "JavaScript" },
  { value: CourseCategory.TYPESCRIPT, label: "TypeScript" },
  { value: CourseCategory.FRONTEND, label: "Frontend" },
  { value: CourseCategory.BACKEND, label: "Backend" },
  { value: CourseCategory.FULLSTACK, label: "Fullstack" },
  { value: CourseCategory.CLOUD, label: "Cloud" },
  { value: CourseCategory.AI, label: "IA" },
  { value: CourseCategory.DEVOPS, label: "DevOps" },
  { value: CourseCategory.PRODUCTIVITY, label: "Productivité" },
];

const LEVELS = [
  { value: CourseLevel.BEGINNER, label: "Débutant" },
  { value: CourseLevel.INTERMEDIATE, label: "Intermédiaire" },
  { value: CourseLevel.ADVANCED, label: "Avancé" },
  { value: CourseLevel.EXPERT, label: "Expert" },
];

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    router.push(`/formations?${createQueryString("search", value)}`);
  };

  const handleCategoryChange = (value: string) => {
    router.push(`/formations?${createQueryString("category", value)}`);
  };

  const handleLevelChange = (value: string) => {
    router.push(`/formations?${createQueryString("level", value)}`);
  };

  const clearFilters = () => {
    router.push("/formations");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* Search bar - full width on mobile, centered on desktop */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher une formation..."
              className="pl-10 h-11 text-center sm:text-left"
              defaultValue={searchParams.get("search") || ""}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters row - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
          <Select
            value={searchParams.get("category") || ""}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-48 h-11" aria-label="Toutes les catégories">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("level") || ""}
            onValueChange={handleLevelChange}
          >
            <SelectTrigger className="w-full sm:w-48 h-11" aria-label="Tous les niveaux">
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchParams.get("search") || searchParams.get("category") || searchParams.get("level")) && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full sm:w-auto h-11 px-6"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
