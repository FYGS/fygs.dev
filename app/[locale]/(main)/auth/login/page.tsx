"use client";

import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useIntlayer } from "next-intlayer";
import { useSearchParams } from "next/navigation";

// export const metadata: Metadata = {
//   title: "Connexion | FYGS Learning Platform",
//   description: "Connectez-vous à votre compte pour accéder à vos formations.",
// };

function LoginPageContent() {
  const content = useIntlayer("login-page");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6 pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {content.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            {content.subtitle}
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <LoginForm callbackUrl={callbackUrl || undefined} />
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {content.noAccount}{" "}
              <Link
                href={
                  callbackUrl
                    ? `/auth/register?callbackUrl=${encodeURIComponent(
                        callbackUrl
                      )}`
                    : "/auth/register"
                }
                className="text-primary hover:underline font-medium"
              >
                {content.signUpLink}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
