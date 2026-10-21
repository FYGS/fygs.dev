"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Key,
} from "lucide-react";
import { useState } from "react";

function AuthFlowVisualizer() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const flows = [
    {
      name: "JWT Authentication",
      color: "border-blue-500/30",
      badge: "text-blue-400",
      steps: [
        {
          label: "Login Request",
          desc: "Client envoie email + mot de passe au serveur",
          code: 'POST /api/auth/login\n{ "email": "alice@test.com", "password": "..." }',
        },
        {
          label: "Verification",
          desc: "Serveur vérifie le hash bcrypt/Argon2",
          code: "const valid = await bcrypt.compare(password, user.passwordHash);\nif (!valid) throw new UnauthorizedError();",
        },
        {
          label: "Token Generation",
          desc: "Génère access (15min) + refresh token (7j)",
          code: 'const accessToken = jwt.sign({ userId, role }, SECRET, { expiresIn: "15m" });\nconst refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });',
        },
        {
          label: "Authenticated Request",
          desc: "Client envoie le token à chaque requête",
          code: 'fetch("/api/data", {\n  headers: { Authorization: `Bearer ${accessToken}` }\n});',
        },
        {
          label: "Token Refresh",
          desc: "Quand access token expire, utilise le refresh pour en obtenir un nouveau",
          code: 'POST /api/auth/refresh\n{ "refreshToken": "eyJhbGci..." }\n// → Nouveau access token',
        },
      ],
      pros: ["Stateless", "Scalable", "Cross-domain"],
      cons: ["Pas révocable nativement", "Payload lisible (base64)"],
    },
    {
      name: "Session-based Auth",
      color: "border-green-500/30",
      badge: "text-green-400",
      steps: [
        {
          label: "Login Request",
          desc: "Client envoie les credentials",
          code: 'POST /api/auth/login\n{ "email": "alice@test.com", "password": "..." }',
        },
        {
          label: "Session Creation",
          desc: "Serveur crée une session dans Redis/DB",
          code: 'const sessionId = crypto.randomUUID();\nawait redis.set(`session:${sessionId}`, JSON.stringify({ userId, role }), "EX", 86400);',
        },
        {
          label: "Cookie Set",
          desc: "Session ID envoyé via cookie HttpOnly sécurisé",
          code: "Set-Cookie: sid=abc123; HttpOnly; Secure; SameSite=Strict; Path=/",
        },
        {
          label: "Auto Request",
          desc: "Cookie envoyé automatiquement à chaque requête",
          code: "// Le navigateur envoie le cookie automatiquement\nGET /api/data\nCookie: sid=abc123",
        },
        {
          label: "Logout",
          desc: "Suppression instantanée de la session côté serveur",
          code: "await redis.del(`session:${sessionId}`);\n// Révocation immédiate — plus d'accès possible",
        },
      ],
      pros: ["Révocable instantanément", "Données côté serveur", "Simple"],
      cons: ["Sticky sessions / stockage centralisé", "CSRF si mal configuré"],
    },
    {
      name: "OAuth 2.0 (Authorization Code)",
      color: "border-purple-500/30",
      badge: "text-purple-400",
      steps: [
        {
          label: "Redirect",
          desc: "App redirige vers le provider (Google/GitHub)",
          code: "GET https://accounts.google.com/o/oauth2/auth\n  ?client_id=YOUR_CLIENT_ID\n  &redirect_uri=https://app.com/callback\n  &scope=openid email profile\n  &response_type=code",
        },
        {
          label: "User Consents",
          desc: "L'utilisateur autorise l'accès à ses données",
          code: '// Google affiche:\n// "App X souhaite accéder à votre nom et email"\n// [Autoriser] [Refuser]',
        },
        {
          label: "Auth Code",
          desc: "Provider redirige avec un code temporaire",
          code: "GET https://app.com/callback?code=4/0AeaYSH...\n// Code valide ~10 minutes, usage unique",
        },
        {
          label: "Token Exchange",
          desc: "Serveur échange le code contre des tokens (server-side)",
          code: 'POST https://oauth2.googleapis.com/token\n{ code, client_id, client_secret, redirect_uri, grant_type: "authorization_code" }',
        },
        {
          label: "User Info",
          desc: "Utilise le token pour récupérer le profil",
          code: "GET https://www.googleapis.com/oauth2/v2/userinfo\nAuthorization: Bearer ya29.a0AVvZVsp...",
        },
      ],
      pros: ["Pas de gestion de mots de passe", "SSO", "Scopes granulaires"],
      cons: ["Complexité du flow", "Dépendance au provider"],
    },
  ];
  const flow = flows[activeFlow];
  const step = flow.steps[activeStep];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Key className="w-6 h-6 text-amber-400" /> Flows d&apos;Authentification
      </h2>
      <div className="flex gap-2 flex-wrap">
        {flows.map((f, i) => (
          <button
            key={f.name}
            onClick={() => {
              setActiveFlow(i);
              setActiveStep(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeFlow === i ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {flow.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border whitespace-nowrap transition-all ${activeStep === i ? `${flow.color} bg-primary/5` : i < activeStep ? "border-green-500/20 text-green-500" : "border-border/20"}`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < activeStep ? "bg-green-500 text-white" : activeStep === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <Card className={`p-6 space-y-4 border-2 ${flow.color}`}>
        <p className="text-sm text-muted-foreground">{step.desc}</p>
        <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border/20" tabIndex={0}>
          <code>{step.code}</code>
        </pre>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-green-400">Avantages</p>
          {flow.pros.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              {p}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-red-400">Inconvénients</p>
          {flow.cons.map((c) => (
            <div key={c} className="flex items-center gap-1.5 text-xs">
              <ArrowRight className="w-3 h-3 text-red-400 shrink-0" />
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="px-4 py-2 rounded-lg bg-muted text-sm disabled:opacity-30"
        >
          Précédent
        </button>
        <button
          onClick={() =>
            setActiveStep(Math.min(flow.steps.length - 1, activeStep + 1))
          }
          disabled={activeStep === flow.steps.length - 1}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-30"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function SecurityChecklist() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const items = [
    {
      category: "Input",
      text: "Input validation avec Zod sur toutes les entrées",
      severity: "critical",
    },
    {
      category: "Rate",
      text: "Rate limiting (100 req/min par IP pour les APIs publiques)",
      severity: "high",
    },
    {
      category: "CORS",
      text: "CORS strict (origines autorisées explicites)",
      severity: "critical",
    },
    {
      category: "Headers",
      text: "Security headers (CSP, HSTS, X-Frame-Options) via Helmet.js",
      severity: "high",
    },
    {
      category: "Auth",
      text: "Password hashing avec bcrypt (12+ rounds) ou Argon2",
      severity: "critical",
    },
    {
      category: "Transport",
      text: "HTTPS obligatoire (HSTS preload)",
      severity: "critical",
    },
    {
      category: "Secrets",
      text: "Secrets dans variables d'environnement (jamais dans le code)",
      severity: "critical",
    },
    {
      category: "SQL",
      text: "Protection SQL injection via ORM paramétrisé (Prisma)",
      severity: "critical",
    },
    {
      category: "CSRF",
      text: "CSRF protection (double-submit cookie ou SameSite=Strict)",
      severity: "high",
    },
    {
      category: "Audit",
      text: "Logging des tentatives de connexion échouées",
      severity: "medium",
    },
    {
      category: "XSS",
      text: "Sanitization des outputs HTML (DOMPurify)",
      severity: "high",
    },
    {
      category: "Deps",
      text: "Audit régulier des dépendances (npm audit, Snyk)",
      severity: "medium",
    },
  ];

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const progress = Math.round((checked.size / items.length) * 100);
  const severityColor = {
    critical: "text-red-500",
    high: "text-orange-400",
    medium: "text-yellow-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" /> Security Checklist
        </h2>
        <Badge
          variant="outline"
          className={`text-sm ${progress === 100 ? "text-green-500 border-green-500/30" : ""}`}
        >
          {progress}%
        </Badge>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : progress > 50 ? "bg-blue-500" : "bg-orange-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg border transition-all ${checked.has(i) ? "bg-green-500/5 border-green-500/20" : "border-border/20 hover:border-border/50"}`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked.has(i) ? "border-green-500 bg-green-500" : "border-border"}`}
            >
              {checked.has(i) && (
                <CheckCircle2 className="w-3 h-3 text-white" />
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] shrink-0 ${severityColor[item.severity as keyof typeof severityColor]}`}
            >
              {item.severity}
            </Badge>
            <span
              className={`text-sm ${checked.has(i) ? "line-through text-muted-foreground" : ""}`}
            >
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function VulnerabilityDemo() {
  const [activeVuln, setActiveVuln] = useState("xss");
  const vulns: Record<
    string,
    {
      name: string;
      icon: typeof AlertTriangle;
      desc: string;
      bad: string;
      good: string;
      color: string;
    }
  > = {
    xss: {
      name: "XSS (Cross-Site Scripting)",
      icon: Eye,
      desc: "Injection de scripts malicieux dans les pages web vues par d'autres utilisateurs.",
      color: "text-red-500",
      bad: `// ❌ Vulnérable au XSS
app.get("/search", (req, res) => {
  const query = req.query.q;
  res.send(\`<h1>Résultats pour: \${query}</h1>\`);
  // Attaque: /search?q=<script>document.cookie</script>
});

// ❌ React dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />`,
      good: `// ✅ Sanitization + Encoding
import DOMPurify from "dompurify";

// Sanitize les inputs
const clean = DOMPurify.sanitize(userContent);

// React échappe automatiquement (sauf dangerouslySetInnerHTML)
<div>{userContent}</div> // Sûr par défaut

// CSP header pour bloquer les scripts inline
Content-Security-Policy: script-src 'self'; object-src 'none';`,
    },
    sqli: {
      name: "SQL Injection",
      icon: AlertTriangle,
      desc: "Injection de requêtes SQL malicieuses via des inputs utilisateur.",
      color: "text-orange-500",
      bad: `// ❌ Vulnérable au SQL Injection
const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
// Attaque: email = "' OR '1'='1' --"
// Résultat: SELECT * FROM users WHERE email = '' OR '1'='1' --'

// ❌ String concatenation
db.query("SELECT * FROM users WHERE id = " + userId);`,
      good: `// ✅ Parameterized queries
db.query("SELECT * FROM users WHERE email = $1", [email]);

// ✅ ORM (Prisma) — paramétrise automatiquement
const user = await prisma.user.findUnique({
  where: { email } // Impossible d'injecter du SQL
});

// ✅ Validation stricte des entrées
const schema = z.object({ email: z.string().email() });
const { email } = schema.parse(input);`,
    },
    csrf: {
      name: "CSRF (Cross-Site Request Forgery)",
      icon: EyeOff,
      desc: "Forcer un utilisateur authentifié à effectuer une action non désirée.",
      color: "text-purple-500",
      bad: `// ❌ Vulnérable au CSRF
// Sur evil.com:
<img src="https://bank.com/transfer?to=hacker&amount=10000" />
// Le cookie de session est envoyé automatiquement !

// ❌ Pas de protection CSRF
app.post("/transfer", async (req, res) => {
  // Exécute la transaction sans vérification
});`,
      good: `// ✅ Protection CSRF
// SameSite cookie (première ligne de défense)
Set-Cookie: sid=abc; SameSite=Strict; HttpOnly; Secure

// ✅ Double Submit Cookie
const csrfToken = crypto.randomUUID();
res.cookie("csrf", csrfToken, { httpOnly: false });
// Le client envoie le token dans le header
// X-CSRF-Token: <token from cookie>

// ✅ Vérification côté serveur
if (req.headers["x-csrf-token"] !== req.cookies.csrf) {
  throw new ForbiddenError("CSRF token mismatch");
}`,
    },
  };
  const current = vulns[activeVuln];
  const Icon = current.icon;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-red-400" /> Vulnérabilités
        Courantes
      </h2>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(vulns).map(([key, v]) => (
          <button
            key={key}
            onClick={() => setActiveVuln(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeVuln === key ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
          >
            {v.name.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${current.color}`} />
        <div>
          <p className="font-semibold">{current.name}</p>
          <p className="text-sm text-muted-foreground">{current.desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Badge className="bg-red-500/10 text-red-400 text-[10px]">
            VULNERABLE
          </Badge>
          <pre className="bg-red-500/5 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-red-500/10 max-h-[280px] overflow-y-auto" tabIndex={0}>
            <code>{current.bad}</code>
          </pre>
        </div>
        <div className="space-y-2">
          <Badge className="bg-green-500/10 text-green-400 text-[10px]">
            SECURE
          </Badge>
          <pre className="bg-green-500/5 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-green-500/10 max-h-[280px] overflow-y-auto" tabIndex={0}>
            <code>{current.good}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function BackendSecurityPage() {
  return (
    <div className="container py-8 space-y-16 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Sécurité Backend
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Authentification, vulnérabilités (XSS, SQLI, CSRF) et checklist de
            sécurité &mdash; comprenez et protégez vos applications backend.
          </p>
        </div>
      </section>

      <Card className="p-8 border-border/40">
        <AuthFlowVisualizer />
      </Card>
      <Card className="p-8 border-border/40">
        <SecurityChecklist />
      </Card>
      <Card className="p-8 border-border/40">
        <VulnerabilityDemo />
      </Card>
    </div>
  );
}
