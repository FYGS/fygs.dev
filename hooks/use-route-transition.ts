"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

export function useRouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return {
    navigate,
    isPending,
    currentPath: pathname,
  };
}
