"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "@/lib/auth-client";
import { hardNavigate } from "@/lib/browser-effects";

interface Props {
  hasPassword: boolean;
  twoFactorEnabled: boolean;
}

export function DeleteAccountCard({ hasPassword, twoFactorEnabled }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation,
          ...(hasPassword && { password }),
          ...(twoFactorEnabled && { code }),
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "La suppression a échoué. Réessayez.");
        return;
      }
      await signOut().catch(() => undefined);
      hardNavigate("/");
    } catch {
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  const ready = confirmation.trim() === "SUPPRIMER" && (!hasPassword || password !== "") && (!twoFactorEnabled || code.trim() !== "");

  return (
    <Card id="delete-account" className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" aria-hidden />
          Supprimer mon compte
        </CardTitle>
        <CardDescription>
          Votre nom, votre adresse e-mail, votre photo et vos notes sont effacés ; ce que vous avez publié (discussions, avis) reste sous la mention
          « Compte supprimé ». Vos justificatifs de paiement sont conservés pour la durée que la loi impose. Cette action est définitive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!open ? (
          <Button type="button" variant="outline" className="border-destructive/50 text-destructive" onClick={() => setOpen(true)}>
            Supprimer mon compte…
          </Button>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="delete-password">Votre mot de passe</Label>
                <Input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} className="max-w-xs" />
              </div>
            )}
            {twoFactorEnabled && (
              <div className="space-y-2">
                <Label htmlFor="delete-code">Code de votre application d&apos;authentification</Label>
                <Input id="delete-code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} disabled={pending} className="max-w-40 font-mono tracking-widest" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Pour confirmer, saisissez <strong>SUPPRIMER</strong>
              </Label>
              <Input id="delete-confirmation" autoComplete="off" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} disabled={pending} className="max-w-xs" />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={pending || !ready}>
                {pending ? "Suppression…" : "Supprimer définitivement"}
              </Button>
              <Button type="button" variant="ghost" disabled={pending} onClick={() => { setOpen(false); setError(null); }}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
