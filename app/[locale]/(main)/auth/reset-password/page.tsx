"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const errorParam = params.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const invalid = !token || !!errorParam;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await authService.resetPassword(token, data.password);
      if (!result.success) {
        setError("password", { message: result.error || "Impossible de réinitialiser le mot de passe" });
      } else {
        toast.success("Mot de passe réinitialisé avec succès !",{
          description: "Vous pouvez maintenant vous connecter.",
        });
        router.push("/auth/login");
      }
    } catch {
      setError("password", { message: "Une erreur s'est produite" });
      toast.error("Erreur lors de la réinitialisation",{
        description: "Une erreur est survenue lors de la réinitialisation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Réinitialiser le mot de passe</CardTitle>
          <p className="text-muted-foreground">
            {invalid ? "Le lien est invalide ou expiré." : "Entrez votre nouveau mot de passe."}
          </p>
        </CardHeader>
        <CardContent>
          {invalid ? (
            <div className="text-center space-y-4">
              <Button onClick={() => router.push("/auth/forgot-password")}>Demander un nouveau lien</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={isLoading} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} disabled={isLoading} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Réinitialisation..." : "Réinitialiser"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">Réinitialisation du mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
