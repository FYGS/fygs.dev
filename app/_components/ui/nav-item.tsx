"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  href: string;
  label: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export function NavItem({
  href,
  label,
  onClick,
  isMobile = false,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        isMobile
          ? cn(
              "px-6 py-4 text-base transition-all relative border-b border-border/20 last:border-b-0",
              isActive
                ? "bg-linear-to-r from-primary/5 to-secondary/5 text-primary font-semibold"
                : "text-foreground/80 hover:bg-accent/30 hover:text-foreground"
            )
          : cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-base font-medium transition-all duration-300 relative group",
              "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-linear-to-r after:from-primary after:to-primary/60 after:transition-transform after:duration-300",
              "hover:scale-105 hover:shadow-xs",
              isActive
                ? "text-primary after:scale-x-100 shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:after:scale-x-100"
            )
      )}
      aria-current={isActive ? "page" : undefined}
      >
      {label}
    </Link>
  );
}
