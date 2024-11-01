"use client";

import { useRouteTransition } from "@/hooks/use-route-transition";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  activeClassName?: string;
  children: React.ReactNode;
}

export function NavLink({
  href,
  className,
  activeClassName,
  children,
  ...props
}: NavLinkProps) {
  const { currentPath } = useRouteTransition();
  const isActive = currentPath === href;

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="activeNavLink"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
}
