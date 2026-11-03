"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { twoFactor } from "@/lib/auth-client";
import { hardNavigate } from "@/lib/browser-effects";
import { safeInternalPath } from "@/lib/safe-redirect";

type Method = "totp" | "backup";

/** What to tell the person, from the error the server answered. The server never says which part was wrong. */
function messageFor(error: { code?: string; message?: string; status?: number }): { text: string; restart: boolean } {
  const code = error.code ?? "";
  if (code === "INVALID_TWO_FACTOR_COOKIE" || code === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE" || error.status === 429) {
    return { text: "La vérification a expiré ou les tentatives sont épuisées. Reconnectez-vous pour recommencer.", restart: true };
  }
  return { text: "Code incorrect. Vérifiez l'heure de votre téléphone et réessayez.", restart: false };
}

function TwoFactorContent() {
  const params = useSearchParams();
  const destination = safeInternalPath(params.get("callbackUrl"));
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; restart: boolean } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const isBackup = method === "backup";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = code.replace(/\s+/g, "");
    if (!value) return;
    setPending(true);
    setError(null);
    try {
      const result = isBackup ? await twoFactor.verifyBackupCode({ code: value }) : await twoFactor.verifyTotp({ code: value });
      if (result.error) {
        setError(messageFor(result.error));
        setCode("");
        input.current?.focus();
        return;
      }
      // A full page load, so that every server-rendered part picks up the new session
      hardNavigate(destination);
    } catch {
      setError({ text: "Une erreur s'est produite. Réessayez.", restart: false });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <CardTitle as="h1" className="text-2xl font-bold">
            Vérification en deux étapes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isBackup
              ? "Saisissez l'un de vos codes de secours. Chaque code ne sert qu'une fois."
              : "Saisissez le code à 6 chiffres affiché par votre application d'authentification."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="two-factor-code">{isBackup ? "Code de secours" : "Code à 6 chiffres"}</Label>
              <Input
                id="two-factor-code"
                ref={input}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode={isBackup ? "text" : "numeric"}
                autoComplete="one-time-code"
                autoFocus
                maxLength={isBackup ? 24 : 7}
                spellCheck={false}
                disabled={pending}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "two-factor-error" : undefined}
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>
            {error && (
              <p id="two-factor-error" role="alert" className="text-sm text-destructive">
                {error.text}{" "}
                {error.restart && (
                  <Link href={`/auth/login?callbackUrl=${encodeURIComponent(destination)}`} className="font-medium underline">
                    Retourner à la connexion
                  </Link>
                )}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending || code.trim() === ""}>
              {pending ? "Vérification…" : "Vérifier"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => {
                setMethod(isBackup ? "totp" : "backup");
                setCode("");
                setError(null);
              }}
            >
              {isBackup ? "Utiliser mon application d'authentification" : "Utiliser un code de secours"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="min-h-screen flex items-center justify-center">
          Chargement…
        </div>
      }
    >
      <TwoFactorContent />
    </Suspense>
  );
}
