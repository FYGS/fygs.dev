"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordToggle } from "@/components/ui/password-toggle";
import { FieldError, fieldErrorProps } from "@/components/ui/field-error";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/lib/auth-service";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIntlayer } from "next-intlayer";

interface RegisterFormProps {
  callbackUrl?: string | null;
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const content = useIntlayer("register-form");

  const registerSchema = z
    .object({
      name: z.string().min(2, content.form.name.error.minLength.value),
      email: z.string().email(content.form.email.error.invalid.value),
      password: z.string().min(8, content.form.password.error.minLength.value),
      confirmPassword: z.string(),
      acceptTerms: z
        .union([z.boolean(), z.string()])
        .transform((val) => val === true || val === "true"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: content.form.confirmPassword.error.mismatch.value,
      path: ["confirmPassword"],
    })
    .refine((data) => data.acceptTerms === true, {
      message: content.form.acceptTerms.error.value,
      path: ["acceptTerms"],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<z.input<typeof registerSchema>, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const acceptTerms = useWatch({ control, name: "acceptTerms" });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.signUpWithEmail({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (!result.success) {
        setError("root", {
          message: result.error || content.messages.error.generic.value,
        });
      } else {
        toast.success(content.messages.success.title.value, {
          description: content.messages.success.description.value,
        });
        const verifyUrl = `/auth/verify?email=${encodeURIComponent(
          data.email
        )}${
          callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
        }`;
        router.push(verifyUrl);
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
      // Store callbackUrl in sessionStorage for post-auth redirect
      if (callbackUrl) {
        sessionStorage.setItem("authCallbackUrl", callbackUrl);
      }
      await authService.signInWithProvider(provider);
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{content.form.name.label}</Label>
          <Input
            id="name"
            type="text"
            placeholder={content.form.name.placeholder.value}
            {...register("name")}
              {...fieldErrorProps("name", errors.name)}
              autoComplete="name"
            disabled={isLoading}
          />
          <FieldError id="name" message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{content.form.email.label}</Label>
          <Input
            id="email"
            type="email"
            placeholder={content.form.email.placeholder.value}
            {...register("email")}
              {...fieldErrorProps("email", errors.email)}
              autoComplete="email"
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
              autoComplete="new-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {content.form.confirmPassword.label}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={content.form.confirmPassword.placeholder.value}
              {...register("confirmPassword")}
              {...fieldErrorProps("confirmPassword", errors.confirmPassword)}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            />
          </div>
          <FieldError id="confirmPassword" message={errors.confirmPassword?.message} />
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                checked={field.value === true}
                onCheckedChange={field.onChange}
                disabled={isLoading}
                {...fieldErrorProps("acceptTerms", errors.acceptTerms)}
              />
            )}
          />
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {content.form.acceptTerms.text}{" "}
            <Link href="/terms" className="text-primary hover:underline">
              {content.form.acceptTerms.terms}
            </Link>{" "}
            {content.form.acceptTerms.and}{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              {content.form.acceptTerms.privacy}
            </Link>
          </Label>
        </div>
        <FieldError id="acceptTerms" message={errors.acceptTerms?.message} />

        {errors.root && (
          <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !acceptTerms}
        >
          {isLoading ? content.form.submit.loading : content.form.submit.idle}
        </Button>
      </form>
    </div>
  );
}
