"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Search({ className, ...props }: SearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (term: string) => {
    startTransition(() => {
      const queryString = createQueryString("q", term);
      router.push(`${pathname}?${queryString}`);
    });
  };

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search articles..."
        className="pl-8"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        {...props}
      />
      {isPending && (
        <div className="absolute right-2 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
      )}
    </div>
  );
}
