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
              "px-6 py-3 text-base transition-all relative",
              isActive
                ? "bg-accent text-primary font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )
          : cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-base font-medium transition-all relative",
              "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-primary after:transition-transform",
              isActive
                ? "text-primary after:scale-x-100"
                : "text-muted-foreground hover:text-foreground hover:after:scale-x-100"
            )
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
