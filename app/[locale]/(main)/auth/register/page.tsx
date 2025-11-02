"use client";

import { Suspense } from "react";
import { RegisterForm } from "./_components/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useIntlayer } from "next-intlayer";
import { useSearchParams } from "next/navigation";

// export const metadata: Metadata = {
//   title: "Inscription | FYGS Learning Platform",
//   description: "Créez votre compte pour accéder à nos formations premium.",
// };
function RegisterPageContent() {
  const content = useIntlayer("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6 pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {content.register.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm sm:text-base">
            {content.register.subtitle}
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <RegisterForm callbackUrl={callbackUrl} />
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {content.register.hasAccount}{" "}
              <Link
                href={
                  callbackUrl
                    ? `/auth/login?callbackUrl=${encodeURIComponent(
                        callbackUrl
                      )}`
                    : "/auth/login"
                }
                className="text-primary hover:underline font-medium"
              >
                {content.register.signInLink}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
