"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  Filter,
  X,
  Star,
  MessageSquare,
  Shield,
  TrendingUp,
  Clock,
  RotateCcw
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StarRating } from "./star-rating";

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export interface ReviewFilters {
  search?: string;
  rating?: number[];
  verified?: boolean;
  hasComment?: boolean;
  hasReplies?: boolean;
  minHelpfulVotes?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low' | 'relevance';
}

interface ReviewFilterPanelProps {
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  onSearch?: (query: string) => void;
  showAdvanced?: boolean;
  facets?: {
    ratings: Array<{ value: number; count: number }>;
    dateRanges: Array<{ label: string; count: number }>;
  };
  className?: string;
}

export function ReviewFilterPanel({
  filters,
  onFiltersChange,
  onSearch,
  showAdvanced = true,
  facets,
  className
}: ReviewFilterPanelProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce((q: string) => {
        onSearch?.(q);
        onFiltersChange({ ...filters, search: q });
      }, 300);
      debouncedFn(query);
    },
    [onSearch, onFiltersChange, filters]
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const updateFilter = (key: keyof ReviewFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({});
  };

  const clearSpecificFilter = (key: keyof ReviewFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    if (key === 'search') {
      setSearchValue("");
    }
    onFiltersChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof ReviewFilters];
      return value !== undefined && value !== null && value !== "";
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans les avis..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearchChange("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label="Effacer la recherche"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Sort Options */}
        <Select
          value={filters.sortBy || "newest"}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-[160px]" aria-label="Trier par">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Plus récents
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Plus anciens
              </div>
            </SelectItem>
            <SelectItem value="helpful">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Plus utiles
              </div>
            </SelectItem>
            <SelectItem value="rating_high">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Note décroissante
              </div>
            </SelectItem>
            <SelectItem value="rating_low">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Note croissante
              </div>
            </SelectItem>
            {filters.search && (
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Pertinence
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "gap-2",
              activeFilterCount > 0 && "border-blue-500 text-blue-600"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: &quot;{filters.search}&quot;
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearSpecificFilter('search')}
              />
            </Badge>
          )}
          
          {filters.rating && filters.rating.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Note: {filters.rating.join(", ")} étoiles
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearSpecificFilter('rating')}
              />
            </Badge>
          )}

          {filters.verified && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Vérifiés uniquement
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearSpecificFilter('verified')}
              />
            </Badge>
          )}

          {filters.hasComment && (
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              Avec commentaire
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearSpecificFilter('hasComment')}
              />
            </Badge>
          )}

          {filters.minHelpfulVotes && filters.minHelpfulVotes > 0 && (
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Min. {filters.minHelpfulVotes} votes utiles
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearSpecificFilter('minHelpfulVotes')}
              />
            </Badge>
          )}

          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="h-3 w-3" />
              Période personnalisée
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  clearSpecificFilter('dateFrom');
                  clearSpecificFilter('dateTo');
                }}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Note</Label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating?.includes(rating) || false}
                      onCheckedChange={(checked) => {
                        const currentRatings = filters.rating || [];
                        if (checked) {
                          updateFilter('rating', [...currentRatings, rating]);
                        } else {
                          updateFilter('rating', currentRatings.filter(r => r !== rating));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`rating-${rating}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <StarRating rating={rating} size="sm" />
                      {facets?.ratings.find(r => r.value === rating) && (
                        <span className="text-muted-foreground">
                          ({facets.ratings.find(r => r.value === rating)?.count})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contenu</Label>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={filters.verified || false}
                  onCheckedChange={(checked) => updateFilter('verified', checked)}
                />
                <Label htmlFor="verified" className="text-sm">
                  Utilisateurs vérifiés
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasComment"
                  checked={filters.hasComment || false}
                  onCheckedChange={(checked) => updateFilter('hasComment', checked)}
                />
                <Label htmlFor="hasComment" className="text-sm">
                  Avec commentaire
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasReplies"
                  checked={filters.hasReplies || false}
                  onCheckedChange={(checked) => updateFilter('hasReplies', checked)}
                />
                <Label htmlFor="hasReplies" className="text-sm">
                  Avec réponses
                </Label>
              </div>
            </div>

            {/* Engagement Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Votes utiles minimum: {filters.minHelpfulVotes || 0}
              </Label>
              <Slider
                value={[filters.minHelpfulVotes || 0]}
                onValueChange={([value]) => updateFilter('minHelpfulVotes', value)}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Période</Label>
            
            {/* Quick Date Ranges */}
            {facets?.dateRanges && (
              <div className="flex flex-wrap gap-2 mb-3">
                {facets.dateRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Set date range based on label
                      const now = new Date();
                      let dateFrom: Date;
                      
                      switch (range.label) {
                        case "Dernières 24h":
                          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                          break;
                        case "Dernière semaine":
                          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          break;
                        case "Dernier mois":
                          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          break;
                        case "Derniers 3 mois":
                          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          break;
                        case "Dernière année":
                          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                          break;
                        default:
                          return;
                      }
                      
                      updateFilter('dateFrom', dateFrom);
                      updateFilter('dateTo', undefined);
                    }}
                    className="text-xs"
                  >
                    {range.label} ({range.count})
                  </Button>
                ))}
              </div>
            )}

            {/* Custom Date Range */}
            <div className="flex gap-2">
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? (
                      format(filters.dateFrom, "PPP", { locale: fr })
                    ) : (
                      "Date de début"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => {
                      updateFilter('dateFrom', date);
                      setDateFromOpen(false);
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? (
                      format(filters.dateTo, "PPP", { locale: fr })
                    ) : (
                      "Date de fin"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => {
                      updateFilter('dateTo', date);
                      setDateToOpen(false);
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}