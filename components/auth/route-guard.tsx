"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { Role } from "@prisma/client";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: Role;
  fallbackUrl?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = false, 
  requireRole,
  fallbackUrl = "/auth/login" 
}: RouteGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!requireAuth) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const session = await authClient.getSession();
        
        if (!session.data?.user) {
          router.push(fallbackUrl);
          return;
        }

        // Check role if required - fix type error by casting user
        const user = session.data.user as any;
        if (requireRole && user.role !== requireRole) {
          router.push("/dashboard"); // Redirect to dashboard if wrong role
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push(fallbackUrl);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, requireRole, fallbackUrl, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, "children"> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Hook for checking authentication status
export function useAuthGuard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const userData = session.data?.user as any;
        setUser(userData || null);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'better-auth.session_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isInstructor: user?.role === Role.INSTRUCTOR,
    isAdmin: user?.role === Role.ADMIN,
    isStudent: user?.role === Role.STUDENT || !user?.role,
  };
}
