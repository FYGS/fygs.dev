"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      // Check for stored callback URL from social login
      const callbackUrl = sessionStorage.getItem('auth_callback_url');
      
      if (callbackUrl) {
        sessionStorage.removeItem('auth_callback_url');
        window.location.href = decodeURIComponent(callbackUrl);
      } else {
        router.push('/dashboard');
      }
    } else if (!isPending && !session) {
      // Authentication failed, redirect to login
      router.push('/auth/login');
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finalisation de la connexion...</p>
      </div>
    </div>
  );
}