"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";
import { Github, Mail, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithEmail({
        email: data.email,
        password: data.password,
        rememberMe: true,
      });

      if (!result.success) {
        setError("root", { message: result.error || "Une erreur s'est produite" });
        if (result.requiresVerification) {
          setPendingVerificationEmail(data.email);
        }
      } else {
        toast.success("Connexion réussie !",{
          description: "Redirection en cours...",
        });
        // Redirect to callback URL or dashboard
        const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : "/dashboard";
        
        // Use window.location.href for better compatibility with external redirects
        window.location.href = redirectUrl;
      }
    } catch {
      setError("root", { message: "Une erreur s'est produite" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      // Store callback URL in sessionStorage for social login redirect
      if (callbackUrl) {
        sessionStorage.setItem('auth_callback_url', callbackUrl);
      }
      await authService.signInWithProvider(provider);
    } catch (error) {
      console.error("Social login error:", error);
      toast.error("Erreur lors de la connexion avec " + provider,{
        description: "Une erreur est survenue lors de la connexion avec " + provider,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Social Login */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 sm:h-10 text-sm sm:text-base"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
        >
          <Github className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Continuer avec GitHub</span>
        </Button>
        <Button
          variant="outline"
          className="w-full h-11 sm:h-10 text-sm sm:text-base"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          <Mail className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Continuer avec Google</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuer avec
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-sm text-muted-foreground"
          type="button"
          onClick={() => router.push("/auth/forgot-password")}
        >
          Mot de passe oublié ?
        </Button>
        {pendingVerificationEmail && (
          <div className="mt-2">
            <Button
              variant="link"
              className="text-sm"
              type="button"
              onClick={async () => {
                try {
                  const result = await authService.sendVerificationEmail(pendingVerificationEmail);
                  if (result.success) {
                    toast.success("Email de vérification renvoyé !",{
                      description: "Si un compte existe pour cet email, un lien a été envoyé.",
                    });
                  } else {
                    toast.error("Erreur lors de l'envoi",{
                      description: result.error || "Erreur lors de l'envoi",
                    });
                  }
                } catch {
                  toast.error("Une erreur s'est produite",{
                    description: "Une erreur est survenue lors de l'envoi de l'email",
                  });
                }
              }}
            >
              Renvoyer l&apos;email de vérification
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
