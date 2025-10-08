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
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { authService } from "@/lib/auth-service";

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

  if (isPending) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/auth/login" onClick={onItemClick}>Connexion</Link>
          </Button>
          <Button size="sm" className="w-full" asChild>
            <Link href="/auth/register" onClick={onItemClick}>S&apos;inscrire</Link>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login">Connexion</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/register">S&apos;inscrire</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
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
          <Link href="/dashboard" className="cursor-pointer" onClick={onItemClick}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/my-courses" className="cursor-pointer" onClick={onItemClick}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Mes formations</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer" onClick={onItemClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/billing" className="cursor-pointer" onClick={onItemClick}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Facturation</span>
          </Link>
        </DropdownMenuItem>
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
