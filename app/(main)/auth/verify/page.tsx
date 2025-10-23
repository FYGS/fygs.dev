"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from URL params if available
  const emailFromParams = searchParams.get("email");

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromParams || "",
    }
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await authService.sendVerificationEmail(data.email);
      
      if (!result.success) {
        setError("email", { message: result.error || "Impossible d'envoyer l'email" });
      } else {
        setSent(true);
        setCountdown(60); // 60 second cooldown
        toast.success("Email de vérification envoyé !",{
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

  const handleQuickResend = async () => {
    if (!emailFromParams || countdown > 0) return;
    
    setIsLoading(true);
    try {
      const result = await authService.sendVerificationEmail(emailFromParams);
      
      if (result.success) {
        setSent(true);
        setCountdown(60);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Vérifiez votre email</CardTitle>
          <p className="text-muted-foreground">
            {emailFromParams 
              ? `Nous avons envoyé un lien de vérification à ${emailFromParams}`
              : "Entrez votre email pour recevoir un lien de vérification"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailFromParams && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Vérifiez votre boîte mail et vos spams
              </div>
              
              <Button
                onClick={handleQuickResend}
                disabled={isLoading || countdown > 0}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : countdown > 0 ? (
                  `Renvoyer dans ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renvoyer le lien
                  </>
                )}
              </Button>

              {sent && (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                  <CheckCircle className="h-3 w-3" />
                  Email envoyé
                </Badge>
              )}
            </div>
          )}

          {!emailFromParams && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="vous@email.com" 
                  {...register("email")} 
                  disabled={isLoading} 
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => router.push("/auth/login")}
              className="text-sm"
            >
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">Vérification de l&apos;email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
