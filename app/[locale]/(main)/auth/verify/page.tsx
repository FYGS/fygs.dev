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
import { useIntlayer } from "next-intlayer";

function VerifyEmailContent() {
  const content = useIntlayer("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from URL params if available
  const emailFromParams = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl");

  const schema = z.object({
    email: z.string().email(String(content.verify.title)),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromParams || "",
    },
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
        setError("email", {
          message: result.error || content.verify.title.value,
        });
      } else {
        setSent(true);
        setCountdown(60);
        toast.success(content.verify.title.value);
      }
    } catch {
      setError("email", { message: content.verify.title.value });
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
        toast.success(content.verify.title.value);
      } else {
        toast.error(content.verify.title.value);
      }
    } catch {
      toast.error(content.verify.title.value);
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
          <CardTitle className="text-2xl font-bold">
            {content.verify.title}
          </CardTitle>
          <p className="text-muted-foreground">
            {emailFromParams
              ? `${content.verify.description} ${emailFromParams}`
              : content.verify.checkInbox}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailFromParams && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {content.verify.checkInbox}
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
                    {content.common.loading}
                  </>
                ) : countdown > 0 ? (
                  `${content.verify.resend} ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {content.verify.resend}
                  </>
                )}
              </Button>

              {sent && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 w-fit mx-auto"
                >
                  <CheckCircle className="h-3 w-3" />
                  Email envoyé
                </Badge>
              )}
            </div>
          )}

          {!emailFromParams && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {content.forgotPassword.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? content.common.loading : content.verify.resend}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                const url = callbackUrl
                  ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/auth/login";
                router.push(url);
              }}
              className="text-sm"
            >
              {content.verify.backToLogin}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  const content = useIntlayer("auth");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center">
                {content.verify.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">{content.common.loading}</div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
