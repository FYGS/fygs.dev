"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  User,
  LogOut,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { AdminQuickActions } from "./admin-quick-actions";
import { Role } from "@/lib/generated/prisma/browser";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
  /** What needs the administrator's attention, counted by the layout */
  alerts?: Array<{ label: string; count: number; href: string }>;
}

export function AdminHeader({ user, alerts = [] }: AdminHeaderProps) {
  const router = useRouter();
  const waiting = alerts.reduce((sum, alert) => sum + alert.count, 0);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Déconnexion réussie");
            router.push("/auth/login");
          },
          onError: (ctx: { error?: unknown }) => {
            toast.error("Erreur lors de la déconnexion");
            console.error("Logout error:", ctx.error);
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-red-500/10 text-red-400";
      case Role.INSTRUCTOR:
        return "bg-blue-500/10 text-blue-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case Role.ADMIN:
        return <Shield className="h-3 w-3" />;
      case Role.INSTRUCTOR:
        return <Zap className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-end">
        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <AdminQuickActions userRole={user.role} />

          {/* What is waiting for the administrator */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative" aria-label={waiting > 0 ? `${waiting} élément(s) à traiter` : "Rien à traiter"}>
                <Bell className="h-4 w-4" aria-hidden="true" />
                {waiting > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs">{waiting}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>À traiter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {waiting === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Rien à traiter pour le moment.</p>
              ) : (
                alerts
                  .filter((alert) => alert.count > 0)
                  .map((alert) => (
                    <DropdownMenuItem key={alert.href} asChild>
                      <Link href={alert.href} className="flex items-center justify-between">
                        <span>{alert.label}</span>
                        <Badge variant="secondary">{alert.count}</Badge>
                      </Link>
                    </DropdownMenuItem>
                  ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white">
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </Badge>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard utilisateur
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
