import { Metadata } from "next";
import { LoginForm } from "./_components/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion | FYGS Learning Platform",
  description: "Connectez-vous à votre compte pour accéder à vos formations.",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6 pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">Se connecter</CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            Accédez à votre compte FYGS Learning Platform
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <LoginForm callbackUrl={callbackUrl} />
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link 
                href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
                className="text-primary hover:underline font-medium"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
