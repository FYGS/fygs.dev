"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, fieldErrorProps } from "@/components/ui/field-error";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";
import { useIntlayer } from "next-intlayer";

export default function ForgotPasswordPage() {
  const content = useIntlayer("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().email(content.forgotPassword.emailLabel.value),
  });

  type FormData = z.infer<typeof schema>;

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
        setError("email", {
          message: result.error || content.forgotPassword.success.value,
        });
      } else {
        setSent(true);
        toast.success(content.forgotPassword.success.value);
      }
    } catch {
      setError("email", { message: content.forgotPassword.success.value });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            {content.forgotPassword.title}
          </CardTitle>
          <p className="text-muted-foreground">
            {content.forgotPassword.description}
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm">{content.forgotPassword.success}</p>
              <Button asChild>
                <Link href="/auth/login">{content.forgotPassword.backToLogin}</Link>
              </Button>
            </div>
          ) : (
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
              {...fieldErrorProps("email", errors.email)}
              autoComplete="email"
                  disabled={isLoading}
                />
                <FieldError id="email" message={errors.email?.message} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? content.common.loading
                  : content.forgotPassword.sendLink}
              </Button>
              <div className="text-center">
                <Button variant="link" asChild>
                  <Link href="/auth/login">{content.forgotPassword.backToLogin}</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
