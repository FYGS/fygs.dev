"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";
import { User, Settings, LogOut, BookOpen, CreditCard } from "lucide-react";
import { LocaleAwareLink } from "@/components/ui/locale-aware-nav";
import { useSession } from "@/lib/auth-client";
import { authService } from "@/lib/auth-service";
import { useAdminAccess } from "@/lib/user-access";
import { useIntlayer } from "next-intlayer";

interface AppUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface AuthNavProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export function AuthNav({ isMobile = false, onItemClick }: AuthNavProps) {
  const { data: session, isPending } = useSession();
  const user: AppUser | null = useMemo(() => session?.user ?? null, [session]);
  const { hasAdminAccess } = useAdminAccess();

  const content = useIntlayer('auth-nav')

  if (isPending) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    if (isMobile) {
      return (
        <div className="space-y-3 w-full">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center"
            asChild
          >
            <LocaleAwareLink href="/auth/login" onClick={onItemClick}>
              Connexion
            </LocaleAwareLink>
          </Button>
          <Button size="lg" className="w-full" asChild>
            <LocaleAwareLink href="/auth/register" onClick={onItemClick}>
              S&apos;inscrire
            </LocaleAwareLink>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <LocaleAwareLink href="/auth/login">{content.connexion}</LocaleAwareLink>
        </Button>
        <Button size="sm" asChild>
          <LocaleAwareLink href="/auth/register">
            {content.inscription}
          </LocaleAwareLink>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={
            user.name
              ? `${content.accountMenu.value} - ${user.name}`
              : content.accountMenu.value
          }
          className="relative h-8 w-8 rounded-full hover:bg-accent transition-all duration-20"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold transition-all duration-200 group-hover:bg-primary/20">
              {user.name?.charAt(0)?.toUpperCase() || (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LocaleAwareLink
            href="/dashboard"
            className="cursor-pointer"
            onClick={onItemClick}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </LocaleAwareLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocaleAwareLink
            href="/dashboard/my-courses"
            className="cursor-pointer"
            onClick={onItemClick}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Mes formations</span>
          </LocaleAwareLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocaleAwareLink
            href="/profile"
            className="cursor-pointer"
            onClick={onItemClick}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </LocaleAwareLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LocaleAwareLink
            href="/dashboard/billing"
            className="cursor-pointer"
            onClick={onItemClick}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Facturation</span>
          </LocaleAwareLink>
        </DropdownMenuItem>
        {/* Show Admin link if user has admin access */}
        {hasAdminAccess && (
          <DropdownMenuItem asChild>
            <LocaleAwareLink
              href="/admin"
              className="cursor-pointer"
              onClick={onItemClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </LocaleAwareLink>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            await authService.signOut();
            onItemClick?.();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
