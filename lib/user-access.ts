import { useSession } from "@/lib/auth-client";
import { Role } from "@prisma/client";

// Extend the session user type to include the role property
interface ExtendedUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role?: string;
  [key: string]: any; // Allow other properties
}

interface SessionWithRole {
  user: ExtendedUser;
  [key: string]: any; // Allow other session properties
}

/**
 * Check if the current user has admin access
 * @returns boolean indicating if user has admin privileges
 */
export const useAdminAccess = () => {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return { hasAdminAccess: false, isAdmin: false, isLoading: true };
  }
  
  const sessionWithRole = session as SessionWithRole | null;
  const isAdmin = sessionWithRole?.user?.role === Role.ADMIN || sessionWithRole?.user?.role === Role.INSTRUCTOR;
  return {
    hasAdminAccess: isAdmin,
    isAdmin,
    isLoading: false,
    userRole: sessionWithRole?.user?.role
  };
};

/**
 * Server-side function to check admin access
 * @param role - The user's role
 * @returns boolean indicating if user has admin privileges
 */
export const hasAdminAccess = (role: string | undefined): boolean => {
  return role === Role.ADMIN || role === Role.INSTRUCTOR;
};