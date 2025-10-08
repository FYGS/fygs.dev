"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await authService.requestPasswordReset(data.email);
      if (!result.success) {
        setError("email", { message: result.error || "Impossible d'envoyer l'email" });
      } else {
        setSent(true);
        toast.success("Email de réinitialisation envoyé !",{
          description: "Si un compte existe pour cet email, un lien a été envoyé.",
        });
      }
    } catch {
      setError("email", { message: "Une erreur s'est produite" });
      toast.error("Erreur lors de l'envoi de l'email",{
        description: "Une erreur est survenue lors de l'envoi de l'email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <p className="text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm">Si un compte existe pour cet email, un lien a été envoyé.</p>
              <Button onClick={() => router.push("/auth/login")}>Retour à la connexion</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="vous@email.com" {...register("email")} disabled={isLoading} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
