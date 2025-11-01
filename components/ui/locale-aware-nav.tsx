"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intlayer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locale-utils";

interface LocaleAwareLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  showActiveIndicator?: boolean;
  locale?: Locale;
}

export function LocaleAwareLink({
  href,
  children,
  className,
  activeClassName,
  showActiveIndicator = false,
  locale,
  ...props
}: LocaleAwareLinkProps) {
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();
  const targetLocale = locale || currentLocale;

  // Construct the locale-aware path
  const localePath = href.startsWith("/")
    ? `/${targetLocale}${href}`
    : `/${targetLocale}/${href}`;

  // Check if this link is active
  const isActive =
    pathname === localePath || pathname.startsWith(localePath + "/");

  return (
    <Link
      href={localePath}
      className={cn(
        "relative transition-colors duration-200",
        isActive && activeClassName,
        className
      )}
      {...props}
    >
      {children}
      {showActiveIndicator && isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

interface LocaleNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface LocaleAwareNavProps {
  items: LocaleNavItem[];
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  orientation?: "horizontal" | "vertical";
}

export function LocaleAwareNav({
  items,
  className,
  itemClassName,
  activeClassName = "text-primary font-semibold",
  orientation = "horizontal",
}: LocaleAwareNavProps) {
  const pathname = usePathname();
  const { locale: currentLocale } = useLocale();

  return (
    <nav
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
        className
      )}
    >
      {items.map((item) => {
        const localePath = `/${currentLocale}${item.href}`;
        const isActive =
          pathname === localePath || pathname.startsWith(localePath + "/");

        return (
          <LocaleAwareLink
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-all duration-200",
              isActive && activeClassName,
              itemClassName
            )}
            showActiveIndicator={orientation === "horizontal"}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </LocaleAwareLink>
        );
      })}
    </nav>
  );
}

interface LocaleBreadcrumb {
  label: string;
  href?: string;
}

interface LocaleBreadcrumbsProps {
  items: LocaleBreadcrumb[];
  className?: string;
  separator?: React.ReactNode;
}

export function LocaleBreadcrumbs({
  items,
  className,
  separator = "/",
}: LocaleBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <LocaleAwareLink
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </LocaleAwareLink>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="text-muted-foreground">{separator}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
