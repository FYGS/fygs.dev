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
import { useIntlayer } from "next-intlayer";

export default function ForgotPasswordPage() {
  const content = useIntlayer("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().email(String(content.forgotPassword.emailLabel)),
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
          message: result.error || String(content.forgotPassword.success),
        });
      } else {
        setSent(true);
        toast.success(String(content.forgotPassword.success));
      }
    } catch {
      setError("email", { message: String(content.forgotPassword.success) });
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
              <Button onClick={() => router.push("/auth/login")}>
                {content.forgotPassword.backToLogin}
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
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? content.common.loading
                  : content.forgotPassword.sendLink}
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/auth/login")}
                  type="button"
                >
                  {content.forgotPassword.backToLogin}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
