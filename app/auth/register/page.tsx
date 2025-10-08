import { Metadata } from "next";
import { RegisterForm } from "./_components/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscription | FYGS Learning Platform",
  description: "Créez votre compte pour accéder à nos formations premium.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6 pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">Créer un compte</CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            Rejoignez FYGS Learning Platform
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <RegisterForm />
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
