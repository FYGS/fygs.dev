"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, Download, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { twoFactor } from "@/lib/auth-client";

interface Props {
  enabled: boolean;
  /** The account signs in with a password (only then can it turn the second factor on or off). */
  hasPassword: boolean;
  /** Administrators and instructors cannot turn it off. */
  staffRole: "ADMIN" | "INSTRUCTOR" | null;
  /** The staff role waits for it: after the set-up, go back to the back office. */
  pendingStaff: boolean;
}

type Step = "idle" | "password" | "verify" | "codes";

/** `JBSWY3DPEHPK3PXP` -> `JBSW Y3DP EHPK 3PXP`: easier to type from a screen. */
function groupKey(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

function secretFrom(uri: string): string {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

const ERRORS: Record<string, string> = {
  INVALID_PASSWORD: "Mot de passe incorrect.",
  INVALID_CODE: "Code incorrect. Vérifiez l'heure de votre téléphone et réessayez.",
  TOTP_ALREADY_ENABLED: "La double authentification est déjà activée.",
};

function describe(error: { code?: string; message?: string }): string {
  return (error.code && ERRORS[error.code]) || error.message || "Une erreur s'est produite. Réessayez.";
}

export function TwoFactorCard({ enabled, hasPassword, staffRole, pendingStaff }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [uri, setUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const secret = secretFrom(uri);

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch {
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  const start = () =>
    run(async () => {
      const result = await twoFactor.enable({ password });
      if (result.error || !result.data) return setError(describe(result.error ?? {}));
      if (result.data.method !== "totp") return setError("Cette méthode n'est pas disponible.");
      setUri(result.data.totpURI);
      setBackupCodes(result.data.backupCodes);
      setPassword("");
      setStep("verify");
    });

  const confirm = () =>
    run(async () => {
      const result = await twoFactor.verifyTotp({ code: code.replace(/\s+/g, "") });
      if (result.error) return setError(describe(result.error));
      setCode("");
      setStep("codes");
    });

  const regenerate = () =>
    run(async () => {
      const result = await twoFactor.generateBackupCodes({ password });
      if (result.error || !result.data) return setError(describe(result.error ?? {}));
      setBackupCodes(result.data.backupCodes);
      setPassword("");
      setStep("codes");
    });

  const disable = () =>
    run(async () => {
      const result = await twoFactor.disable({ password });
      if (result.error) return setError(describe(result.error));
      setPassword("");
      setConfirmDisable(false);
      toast.success("Double authentification désactivée.");
      router.refresh();
    });

  function finish() {
    setBackupCodes([]);
    setStep("idle");
    // A staff account that just enrolled can use its role: back to the back office
    if (pendingStaff) router.push("/admin");
    else router.refresh();
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Codes copiés.");
    } catch {
      toast.error("Copie impossible : sélectionnez les codes et copiez-les à la main.");
    }
  }

  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
    `Codes de secours FYGS\nChaque code ne sert qu'une fois.\n\n${backupCodes.join("\n")}\n`,
  )}`;

  return (
    <Card id="two-factor">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {enabled ? <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden /> : <ShieldOff className="h-5 w-5" aria-hidden />}
            Double authentification
          </CardTitle>
          <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Activée" : "Désactivée"}</Badge>
        </div>
        <CardDescription>
          À chaque connexion, un code à usage unique généré par une application d&apos;authentification s&apos;ajoute au mot de passe.
          {staffRole && " Elle est obligatoire pour les comptes administrateur et formateur."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasPassword && !enabled && (
          <p role="note" className="rounded-md border bg-muted/40 p-3 text-sm">
            Votre compte se connecte avec Google ou GitHub et n&apos;a pas de mot de passe. La double authentification protège la connexion
            par mot de passe : définissez-en un avec{" "}
            <Link href="/auth/forgot-password" className="font-medium underline">
              « Mot de passe oublié »
            </Link>
            , puis revenez ici.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Not enabled */}
        {!enabled && step === "idle" && hasPassword && (
          <Button type="button" onClick={() => setStep("password")}>
            Activer la double authentification
          </Button>
        )}

        {!enabled && step === "password" && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void start();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="tf-password">Votre mot de passe</Label>
              <Input id="tf-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} autoFocus />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending || password === ""}>
                Continuer
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setStep("idle"); setPassword(""); setError(null); }}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <ol className="list-decimal space-y-3 pl-5 text-sm">
              <li>
                Ouvrez votre application d&apos;authentification (Google Authenticator, Microsoft Authenticator, Aegis, 1Password…) et
                ajoutez un compte avec cette clé :
                <div className="mt-2 rounded-md border bg-muted/40 p-3">
                  <p className="select-all break-all font-mono text-base tracking-wider" aria-label="Clé de configuration">{groupKey(secret)}</p>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Sur un téléphone, vous pouvez aussi{" "}
                  <a href={uri} className="font-medium underline">
                    ouvrir directement l&apos;application
                  </a>
                  . Choisissez un code « basé sur le temps ».
                </p>
              </li>
              <li>Saisissez le code à 6 chiffres qu&apos;elle affiche pour confirmer.</li>
            </ol>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void confirm();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="tf-code">Code à 6 chiffres</Label>
                <Input id="tf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} disabled={pending} className="max-w-40 text-center font-mono text-lg tracking-widest" />
              </div>
              <Button type="submit" disabled={pending || code.trim() === ""}>
                Activer
              </Button>
            </form>
          </div>
        )}

        {step === "codes" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Conservez ces codes de secours en lieu sûr.</p>
            <p className="text-sm text-muted-foreground">
              Ils permettent de vous connecter si vous perdez votre téléphone. Chaque code ne sert qu&apos;une fois et ne sera plus affiché.
            </p>
            <ul className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-3 font-mono text-sm sm:grid-cols-3" aria-label="Codes de secours">
              {backupCodes.map((backup) => (
                <li key={backup} className="select-all">{backup}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyCodes}>
                <Copy className="mr-2 h-4 w-4" aria-hidden /> Copier
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href={downloadHref} download="codes-de-secours-fygs.txt">
                  <Download className="mr-2 h-4 w-4" aria-hidden /> Télécharger
                </a>
              </Button>
              <Button type="button" onClick={finish}>
                <Check className="mr-2 h-4 w-4" aria-hidden /> J&apos;ai conservé mes codes
              </Button>
            </div>
          </div>
        )}

        {/* Enabled */}
        {enabled && step === "idle" && (
          <div className="space-y-4">
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void regenerate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="tf-password-manage">Votre mot de passe</Label>
                <Input id="tf-password-manage" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} className="max-w-xs" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="outline" disabled={pending || password === ""}>
                  Générer de nouveaux codes de secours
                </Button>
                {!staffRole && !confirmDisable && (
                  <Button type="button" variant="outline" disabled={pending || password === ""} onClick={() => setConfirmDisable(true)}>
                    Désactiver
                  </Button>
                )}
              </div>
            </form>
            {confirmDisable && (
              <div role="alertdialog" aria-label="Confirmer la désactivation" className="space-y-2 rounded-md border border-destructive/40 p-3">
                <p className="text-sm">Votre compte ne sera plus protégé que par son mot de passe. Désactiver quand même ?</p>
                <div className="flex gap-2">
                  <Button type="button" variant="destructive" disabled={pending} onClick={() => void disable()}>
                    Oui, désactiver
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setConfirmDisable(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
            {staffRole && <p className="text-xs text-muted-foreground">Un compte {staffRole === "ADMIN" ? "administrateur" : "formateur"} ne peut pas désactiver sa double authentification.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
