"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmail } from "@/lib/auth-client";

export function EmailChangeCard({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await changeEmail({ newEmail: newEmail.trim(), callbackURL: "/profile/security" });
      if (result.error) {
        setError(
          result.error.status === 403 || result.error.status === 401
            ? "Pour votre sécurité, reconnectez-vous puis recommencez."
            : result.error.message || "Impossible d'envoyer la demande. Vérifiez l'adresse et réessayez.",
        );
        return;
      }
      setSent(true);
      setNewEmail("");
    } catch {
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card id="email">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" aria-hidden />
          Adresse e-mail
        </CardTitle>
        <CardDescription>
          Adresse actuelle : <strong>{currentEmail}</strong>. Le changement est confirmé deux fois : depuis votre adresse actuelle, puis
          depuis la nouvelle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p role="status" className="rounded-md border bg-muted/40 p-3 text-sm">
            Demande envoyée. Ouvrez le message reçu sur <strong>{currentEmail}</strong> et confirmez : un second message sera alors envoyé à la
            nouvelle adresse. Rien ne change tant que les deux confirmations ne sont pas faites.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-email">Nouvelle adresse e-mail</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                disabled={pending}
                className="max-w-sm"
                aria-describedby={error ? "email-change-error" : undefined}
              />
            </div>
            {error && (
              <p id="email-change-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || newEmail.trim() === ""}>
              {pending ? "Envoi…" : "Demander le changement"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
