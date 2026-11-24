"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ArrowUpDown, CheckIcon } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "recent", labelKey: "sortRecent" as const },
  { value: "oldest", labelKey: "sortOldest" as const },
  { value: "reading-time", labelKey: "sortReadingTime" as const },
  { value: "popular", labelKey: "sortPopular" as const },
] as const;

export function SortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "recent";
  const { sortRecent, sortOldest, sortReadingTime, sortPopular } =
    useIntlayer("blog-page");

  const labels: Record<string, string> = {
    sortRecent: String(sortRecent.value),
    sortOldest: String(sortOldest.value),
    sortReadingTime: String(sortReadingTime.value),
    sortPopular: String(sortPopular.value),
  };

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentLabel =
    labels[
      SORT_OPTIONS.find((o) => o.value === currentSort)?.labelKey ??
        "sortRecent"
    ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label={currentLabel}>
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
          >
            <span className="flex items-center gap-2">
              {currentSort === option.value && (
                <CheckIcon className="h-3.5 w-3.5" />
              )}
              <span
                className={cn(currentSort === option.value && "font-medium")}
              >
                {labels[option.labelKey]}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
