"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw, Home, LogIn } from "lucide-react";
import Link from "next/link";

interface AuthError {
  code: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const AUTH_ERRORS: Record<string, AuthError> = {
  access_denied: {
    code: "access_denied",
    title: "Accès refusé",
    description: "Vous avez annulé la connexion ou refusé l'accès à votre compte. Vous pouvez réessayer quand vous le souhaitez.",
    action: {
      label: "Réessayer la connexion",
      href: "/auth/login"
    }
  },
  invalid_request: {
    code: "invalid_request",
    title: "Requête invalide",
    description: "La demande d'authentification n'est pas valide. Veuillez réessayer.",
    action: {
      label: "Retour à la connexion",
      href: "/auth/login"
    }
  },
  unauthorized_client: {
    code: "unauthorized_client",
    title: "Client non autorisé",
    description: "L'application n'est pas autorisée à effectuer cette demande d'authentification.",
    action: {
      label: "Contacter le support",
      href: "/contact"
    }
  },
  unsupported_response_type: {
    code: "unsupported_response_type",
    title: "Type de réponse non supporté",
    description: "Le type de réponse demandé n'est pas supporté par le serveur d'autorisation.",
    action: {
      label: "Retour à l'accueil",
      href: "/"
    }
  },
  invalid_scope: {
    code: "invalid_scope",
    title: "Portée invalide",
    description: "La portée demandée est invalide, inconnue ou malformée.",
    action: {
      label: "Réessayer",
      href: "/auth/login"
    }
  },
  server_error: {
    code: "server_error",
    title: "Erreur serveur",
    description: "Le serveur d'autorisation a rencontré une erreur inattendue. Veuillez réessayer dans quelques instants.",
    action: {
      label: "Réessayer",
      href: "/auth/login"
    }
  },
  temporarily_unavailable: {
    code: "temporarily_unavailable",
    title: "Service temporairement indisponible",
    description: "Le serveur d'autorisation est temporairement surchargé ou en maintenance. Veuillez réessayer plus tard.",
    action: {
      label: "Réessayer plus tard",
      href: "/"
    }
  },
  invalid_client: {
    code: "invalid_client",
    title: "Client invalide",
    description: "L'authentification du client a échoué. Veuillez contacter le support.",
    action: {
      label: "Contacter le support",
      href: "/contact"
    }
  },
  invalid_grant: {
    code: "invalid_grant",
    title: "Autorisation invalide",
    description: "L'autorisation fournie est invalide, expirée ou révoquée.",
    action: {
      label: "Nouvelle connexion",
      href: "/auth/login"
    }
  },
  unsupported_grant_type: {
    code: "unsupported_grant_type",
    title: "Type d'autorisation non supporté",
    description: "Le type d'autorisation n'est pas supporté par le serveur d'autorisation.",
    action: {
      label: "Retour à la connexion",
      href: "/auth/login"
    }
  },
  email_not_verified: {
    code: "email_not_verified",
    title: "Email non vérifié",
    description: "Votre adresse email n'a pas encore été vérifiée. Vérifiez votre boîte mail ou demandez un nouveau lien.",
    action: {
      label: "Vérifier mon email",
      href: "/auth/verify"
    }
  },
  account_disabled: {
    code: "account_disabled",
    title: "Compte désactivé",
    description: "Votre compte a été temporairement désactivé. Contactez le support pour plus d'informations.",
    action: {
      label: "Contacter le support",
      href: "/contact"
    }
  },
  rate_limit_exceeded: {
    code: "rate_limit_exceeded",
    title: "Trop de tentatives",
    description: "Vous avez effectué trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.",
    action: {
      label: "Réessayer plus tard",
      href: "/auth/login"
    }
  }
};

const DEFAULT_ERROR: AuthError = {
  code: "unknown_error",
  title: "Erreur d'authentification",
  description: "Une erreur inattendue s'est produite lors de l'authentification. Veuillez réessayer.",
  action: {
    label: "Retour à la connexion",
    href: "/auth/login"
  }
};

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<AuthError>(DEFAULT_ERROR);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const errorCode = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (errorCode) {
      const foundError = AUTH_ERRORS[errorCode] || DEFAULT_ERROR;
      
      // Si on a une description personnalisée, on l'utilise
      if (errorDescription) {
        setError({
          ...foundError,
          description: decodeURIComponent(errorDescription)
        });
      } else {
        setError(foundError);
      }
    }
  }, [searchParams]);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Attendre un peu pour l'UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (error.action?.href) {
      router.push(error.action.href);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold text-destructive">
            {error.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {error.description}
            </p>
            
            {error.code !== "unknown_error" && (
              <p className="text-xs text-muted-foreground/70 mt-2">
                Code d&apos;erreur: {error.code}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {error.action && (
              <Button 
                onClick={handleRetry} 
                className="w-full"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    {error.action.label}
                  </>
                )}
              </Button>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="flex-1"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Accueil
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Besoin d&apos;aide ?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contactez le support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Erreur d&apos;authentification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
