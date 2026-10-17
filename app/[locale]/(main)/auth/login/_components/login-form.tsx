"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordToggle } from "@/components/ui/password-toggle";
import { FieldError, fieldErrorProps } from "@/components/ui/field-error";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIntlayer } from "next-intlayer";
import { hardNavigate } from "@/lib/browser-effects";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const content = useIntlayer("login-form");

  const loginSchema = z.object({
    email: z.string().email(content.form.email.error.invalid.value),
    password: z.string().min(6, content.form.password.error.minLength.value),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithEmail({
        email: data.email,
        password: data.password,
        rememberMe: true,
      });

      if (!result.success) {
        setError("root", {
          message: result.error || content.messages.error.generic.value,
        });
        if (result.requiresVerification) {
          setPendingVerificationEmail(data.email);
        }
      } else {
        toast.success(content.messages.success.title.value, {
          description: content.messages.success.description.value,
        });
        // Redirect to callback URL or dashboard
        const redirectUrl = callbackUrl
          ? decodeURIComponent(callbackUrl)
          : "/dashboard";

        // Use window.location.href for better compatibility with external redirects
        hardNavigate(redirectUrl);
      }
    } catch {
      setError("root", { message: content.messages.error.generic.value });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      // Store callback URL in sessionStorage for social login redirect
      if (callbackUrl) {
        sessionStorage.setItem("authCallbackUrl", callbackUrl);
      }
      await authService.signInWithProvider(provider, callbackUrl);
    } catch (error) {
      console.error("Social login error:", error);
      toast.error(`${content.messages.error.socialLogin} ${provider}`, {
        description: `${content.messages.error.socialLogin} ${provider}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Social Login */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 sm:h-10 text-sm sm:text-base"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
        >
          <Github className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">{content.social.github}</span>
        </Button>
        <Button
          variant="outline"
          className="w-full h-11 sm:h-10 text-sm sm:text-base"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          <Mail className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">{content.social.google}</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {content.social.separator}
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{content.form.email.label}</Label>
          <Input
            id="email"
            type="email"
            placeholder={content.form.email.placeholder.value}
            {...register("email")}
              {...fieldErrorProps("email", errors.email)}
              autoComplete="username"
            disabled={isLoading}
          />
          <FieldError id="email" message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{content.form.password.label}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={content.form.password.placeholder.value}
              {...register("password")}
              {...fieldErrorProps("password", errors.password)}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            />
          </div>
          <FieldError id="password" message={errors.password?.message} />
        </div>

        {errors.root && (
          <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? content.form.submit.loading : content.form.submit.idle}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" className="text-sm text-muted-foreground" asChild>
          <Link href="/auth/forgot-password">{content.links.forgotPassword}</Link>
        </Button>
        {pendingVerificationEmail && (
          <div className="mt-2">
            <Button
              variant="link"
              className="text-sm"
              type="button"
              onClick={async () => {
                try {
                  const result = await authService.sendVerificationEmail(
                    pendingVerificationEmail
                  );
                  if (result.success) {
                    toast.success(
                      content.messages.verificationSent.title.value,
                      {
                        description:
                          content.messages.verificationSent.description.value,
                      }
                    );
                  } else {
                    toast.error(
                      content.messages.verificationError.title.value,
                      {
                        description:
                          result.error ||
                          content.messages.verificationError.description.value,
                      }
                    );
                  }
                } catch {
                  toast.error(content.messages.verificationError.title.value, {
                    description:
                      content.messages.verificationError.description.value,
                  });
                }
              }}
            >
              {content.links.resendVerification}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
