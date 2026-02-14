import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Sécurité Backend | TechMastry",
  description:
    "Auth, JWT, OAuth, rate limiting, input validation et bonnes pratiques de sécurité backend",
};

const authFlows = [
  {
    name: "JWT Authentication",
    steps: [
      "User envoie credentials",
      "Server vérifie et génère access + refresh token",
      "Client stocke les tokens",
      "Access token dans Authorization header",
      "Refresh quand expiré",
    ],
    pros: ["Stateless", "Scalable", "Cross-domain"],
    cons: ["Pas révocable natif", "Payload en base64 (lisible)"],
  },
  {
    name: "OAuth 2.0 (Authorization Code)",
    steps: [
      "Redirect vers provider (Google/GitHub)",
      "User autorise",
      "Provider redirect avec auth code",
      "Server échange code contre tokens",
      "Server crée session locale",
    ],
    pros: ["Pas de gestion de mots de passe", "SSO", "Scopes granulaires"],
    cons: ["Complexité du flow", "Dépendance au provider"],
  },
  {
    name: "Session-based Auth",
    steps: [
      "User envoie credentials",
      "Server crée session (stockée en Redis)",
      "Session ID dans cookie HttpOnly",
      "Cookie envoyé automatiquement",
      "Server vérifie session ID",
    ],
    pros: ["Révocable instantanément", "Données côté serveur", "Simple"],
    cons: ["Sticky sessions", "Stockage centralisé nécessaire"],
  },
];

const securityChecklist = [
  "Input validation avec Zod sur toutes les entrées",
  "Rate limiting (100 req/min par IP pour les APIs publiques)",
  "CORS strict (origines autorisées explicites)",
  "Helmet.js pour les security headers (CSP, HSTS, X-Frame-Options)",
  "Password hashing avec bcrypt (12+ rounds) ou Argon2",
  "HTTPS obligatoire (HSTS preload)",
  "Secrets dans des variables d'environnement (jamais dans le code)",
  "SQL injection impossible avec ORM (Prisma paramétrise automatiquement)",
  "CSRF protection avec double-submit cookie ou SameSite=Strict",
  "Logging des tentatives de connexion échouées",
];

export default function BackendSecurityPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Sécurité Backend
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Authentification, autorisation, validation et toutes les bonnes
            pratiques pour sécuriser vos applications backend.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Flows d&apos;Authentification</h2>
        <div className="space-y-6">
          {authFlows.map((flow) => (
            <Card key={flow.name} className="p-6 space-y-4 border-border/40">
              <h3 className="text-xl font-bold">{flow.name}</h3>
              <div className="flex flex-wrap gap-2">
                {flow.steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {step}
                    </span>
                    {i < flow.steps.length - 1 && (
                      <span className="text-muted-foreground mx-1">→</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  {flow.pros.map((p) => (
                    <p key={p} className="text-xs text-muted-foreground">
                      ✅ {p}
                    </p>
                  ))}
                </div>
                <div>
                  {flow.cons.map((c) => (
                    <p key={c} className="text-xs text-muted-foreground">
                      ⚠️ {c}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Checklist Sécurité</h2>
        <Card className="p-6 border-border/40">
          <div className="space-y-3">
            {securityChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-primary/30 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
