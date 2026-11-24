"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Key, Shield, ArrowRight, CheckCircle2, XCircle, Lock, Unlock } from "lucide-react";
import { useState } from "react";

function JwtFlow() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Login Request", desc: "Le client envoie email + mot de passe", icon: "\u{1F4E4}", color: "border-blue-500" },
    { label: "Verification", desc: "Le serveur verifie les credentials (bcrypt)", icon: "\u{1F510}", color: "border-yellow-500" },
    { label: "Token Generation", desc: "Genere Access Token (15min) + Refresh Token (7j)", icon: "\u{1F39F}", color: "border-green-500" },
    { label: "Response", desc: "Retourne les tokens au client", icon: "\u{1F4E5}", color: "border-purple-500" },
    { label: "Authenticated Request", desc: "Authorization: Bearer <accessToken>", icon: "\u{1F511}", color: "border-cyan-500" },
    { label: "Token Refresh", desc: "Quand l'access token expire, utilise le refresh", icon: "\u{1F504}", color: "border-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Key className="w-5 h-5 text-amber-400" /> JWT Authentication Flow
      </h3>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`relative flex items-start gap-4 w-full text-left p-4 rounded-xl transition-all mb-2 ${i === step ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"} ${i <= step ? "opacity-100" : "opacity-40"}`}>
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-2xl border-2 bg-background transition-all ${i === step ? s.color : i < step ? "border-green-500" : "border-border"}`}>
              {i < step ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : s.icon}
            </div>
            <div className="flex-1 pt-2">
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
            {i === step && <Badge variant="secondary" className="mt-2 text-[10px] bg-primary/10 text-primary">Active</Badge>}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-4 py-2 rounded-lg bg-muted text-sm disabled:opacity-30">Precedent</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-30">Suivant</button>
        <button onClick={() => setStep(0)} className="px-4 py-2 rounded-lg border border-border text-sm ml-auto">Reset</button>
      </div>
      {step >= 2 && (
        <div className="space-y-3 p-5 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-sm font-semibold">Anatomie d&apos;un JWT</p>
          <div className="flex flex-wrap gap-1 font-mono text-xs">
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-400">eyJhbGciOiJIUzI1NiIs</span>
            <span className="text-muted-foreground">.</span>
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400">eyJ1c2VySWQiOiIxMjM0</span>
            <span className="text-muted-foreground">.</span>
            <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">SflKxwRJSMeKKF2QT4fw</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded bg-red-500/5 border border-red-500/10"><p className="font-bold text-red-400">Header</p><p className="text-muted-foreground">Algorithm + Type</p></div>
            <div className="p-2 rounded bg-purple-500/5 border border-purple-500/10"><p className="font-bold text-purple-400">Payload</p><p className="text-muted-foreground">Claims (userId, exp...) : encode, non chiffre</p></div>
            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/10"><p className="font-bold text-cyan-400">Signature</p><p className="text-muted-foreground">HMAC(header.payload, secret)</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

function OAuthFlow() {
  const [activeFlow, setActiveFlow] = useState<"authorization_code" | "pkce">("authorization_code");
  const flows = {
    authorization_code: {
      name: "Authorization Code",
      desc: "Flow standard pour les applications web server-side. OAuth 2.1 (en cours de standardisation) rend PKCE obligatoire, même pour les clients confidentiels",
      steps: [
        { from: "Client", to: "Auth Server", label: "1. Redirect /authorize", color: "text-blue-400" },
        { from: "Auth Server", to: "User", label: "2. Login page", color: "text-yellow-400" },
        { from: "User", to: "Auth Server", label: "3. Consent + Credentials", color: "text-green-400" },
        { from: "Auth Server", to: "Client", label: "4. Redirect + code", color: "text-purple-400" },
        { from: "Client", to: "Auth Server", label: "5. POST /token (code + secret)", color: "text-cyan-400" },
        { from: "Auth Server", to: "Client", label: "6. Access + Refresh Token", color: "text-orange-400" },
      ],
    },
    pkce: {
      name: "Authorization Code + PKCE",
      desc: "Flow securise pour SPA et apps mobiles (clients publics, pas de client_secret) ; recommande aussi pour les clients confidentiels",
      steps: [
        { from: "Client", to: "Client", label: "1. Genere code_verifier + code_challenge", color: "text-blue-400" },
        { from: "Client", to: "Auth Server", label: "2. Redirect /authorize + code_challenge", color: "text-yellow-400" },
        { from: "User", to: "Auth Server", label: "3. Login + Consent", color: "text-green-400" },
        { from: "Auth Server", to: "Client", label: "4. Redirect + code", color: "text-purple-400" },
        { from: "Client", to: "Auth Server", label: "5. POST /token (code + code_verifier)", color: "text-cyan-400" },
        { from: "Auth Server", to: "Client", label: "6. Tokens (verifie via PKCE)", color: "text-orange-400" },
      ],
    },
  };
  const flow = flows[activeFlow];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-green-400" /> OAuth 2.0 Flows</h3>
        <div className="flex gap-2">
          {(["authorization_code", "pkce"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFlow(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${activeFlow === f ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}>{flows[f].name}</button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{flow.desc}</p>
      <div className="space-y-2">
        {flow.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <Badge variant="outline" className="text-[10px]">{s.from}</Badge>
              <ArrowRight className={`w-3 h-3 ${s.color}`} />
              <Badge variant="outline" className="text-[10px]">{s.to}</Badge>
            </div>
            <span className={`text-xs ${s.color} ml-auto hidden sm:block`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RbacDemo() {
  const [selectedRole, setSelectedRole] = useState("editor");
  const roles: Record<string, { label: string; permissions: string[]; color: string }> = {
    viewer: { label: "Viewer", permissions: ["read"], color: "text-blue-400" },
    editor: { label: "Editor", permissions: ["read", "write"], color: "text-green-400" },
    admin: { label: "Admin", permissions: ["read", "write", "delete", "manage_users"], color: "text-orange-400" },
    superadmin: { label: "Super Admin", permissions: ["read", "write", "delete", "manage_users", "system_config"], color: "text-red-400" },
  };
  const allPermissions = ["read", "write", "delete", "manage_users", "system_config"];
  const current = roles[selectedRole];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> RBAC - Role-Based Access Control</h3>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(roles).map(([key, role]) => (
          <button key={key} onClick={() => setSelectedRole(key)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedRole === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}>{role.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {allPermissions.map((perm) => {
          const has = current.permissions.includes(perm);
          return (
            <div key={perm} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${has ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20 opacity-50"}`}>
              {has ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
              <span className="text-xs font-mono">{perm}</span>
            </div>
          );
        })}
      </div>
      <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}><code>{`// Middleware d'autorisation
function requirePermission(permission: string) {
  return (req, res, next) => {
    const userRole = req.user.role; // "${selectedRole}"
    const permissions = ROLE_PERMISSIONS[userRole];
    if (permissions.includes(permission)) {
      next(); // Autorise
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
}`}</code></pre>
    </div>
  );
}

function AuthComparison() {
  const methods = [
    { name: "JWT", stateless: true, revocable: false, scalable: true, bestFor: "APIs, Microservices, Mobile" },
    { name: "Session", stateless: false, revocable: true, scalable: true, bestFor: "Apps web traditionnelles (store partagé type Redis)" },
    { name: "OAuth 2.0", stateless: true, revocable: true, scalable: true, bestFor: "SSO, Third-party login" },
    { name: "API Key", stateless: true, revocable: true, scalable: true, bestFor: "APIs publiques, M2M" },
    { name: "mTLS", stateless: true, revocable: true, scalable: true, bestFor: "Microservices internes" },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Comparaison des Methodes</h3>
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/40 bg-muted/30">
            <th className="text-left p-3 font-medium">Methode</th>
            <th className="text-center p-3 font-medium">Stateless</th>
            <th className="text-center p-3 font-medium">Revocable</th>
            <th className="text-center p-3 font-medium">Scalable</th>
            <th className="text-left p-3 font-medium">Meilleur pour</th>
          </tr></thead>
          <tbody>{methods.map((m) => (
            <tr key={m.name} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
              <td className="p-3 font-semibold">{m.name}</td>
              <td className="p-3 text-center">{m.stateless ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
              <td className="p-3 text-center">{m.revocable ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
              <td className="p-3 text-center">{m.scalable ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
              <td className="p-3 text-xs text-muted-foreground">{m.bestFor}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
        <li><strong>Session</strong> : scalable à condition de stocker les sessions dans un store partagé (Redis, base de données) plutôt qu&apos;en mémoire d&apos;une instance ; l&apos;avantage est la révocation immédiate.</li>
        <li><strong>JWT</strong> : sans état, donc valide jusqu&apos;à son expiration. Pour le révoquer, il faut une liste de blocage ou un access token très court associé à un refresh token rotatif.</li>
        <li><strong>OAuth 2.0</strong> : c&apos;est un cadre d&apos;autorisation, pas un format de token. L&apos;access token peut être un JWT (vérifiable localement, difficile à révoquer) ou opaque (révocable, vérifié par introspection, RFC 7662). L&apos;identité relève d&apos;OpenID Connect.</li>
        <li><strong>Passkeys (WebAuthn)</strong> : authentification sans mot de passe par clé publique, liée au domaine et résistante au phishing ; elle ouvre ensuite une session classique ou délivre des tokens.</li>
        <li><strong>Bibliothèques</strong> : l&apos;équipe Auth.js (ex-NextAuth) a rejoint Better Auth ; Auth.js reste maintenu surtout pour les correctifs de sécurité, et Better Auth est recommandé pour les nouveaux projets.</li>
      </ul>
    </div>
  );
}

export default function AuthenticationPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-500"><Users className="w-8 h-8" /></div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Authentification & Autorisation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">JWT, OAuth 2.0/2.1, Sessions, Passkeys, RBAC &mdash; comprenez chaque flow avec des diagrammes interactifs.</p>
        </div>
      </section>
      <Card className="p-8 border-border/40"><JwtFlow /></Card>
      <Card className="p-8 border-border/40"><OAuthFlow /></Card>
      <Card className="p-8 border-border/40"><RbacDemo /></Card>
      <Card className="p-8 border-border/40"><AuthComparison /></Card>
    </div>
  );
}