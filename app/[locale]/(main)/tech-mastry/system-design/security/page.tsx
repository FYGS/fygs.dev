import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/system-design/security");

const securityLayers = [
  {
    layer: "Network",
    items: ["TLS/HTTPS everywhere", "VPC & Private Subnets", "WAF (Web Application Firewall)", "DDoS protection (CloudFlare, AWS Shield)"],
    color: "text-red-500",
  },
  {
    layer: "Application",
    items: ["Input validation (Zod)", "Output encoding", "CORS configuration", "CSP headers", "Rate limiting"],
    color: "text-orange-500",
  },
  {
    layer: "Authentication",
    items: ["OAuth 2.0 / OIDC", "JWT with rotation", "MFA (TOTP/WebAuthn)", "Session management", "Password hashing (bcrypt/Argon2)"],
    color: "text-yellow-500",
  },
  {
    layer: "Authorization",
    items: ["RBAC (Role-Based)", "ABAC (Attribute-Based)", "Row-level security", "API scopes", "Principle of least privilege"],
    color: "text-green-500",
  },
  {
    layer: "Data",
    items: ["Encryption at rest (AES-256)", "Encryption in transit (TLS 1.3)", "Key management (KMS)", "PII anonymization", "Backup encryption"],
    color: "text-blue-500",
  },
];

export default function SystemDesignSecurityPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Sécurité en System Design</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Defense in depth : chaque couche de votre architecture doit intégrer
            la sécurité comme préoccupation fondamentale.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Sécurité en Couches</h2>
        <div className="space-y-4">
          {securityLayers.map((layer) => (
            <Card key={layer.layer} className="p-6 border-border/40">
              <div className="flex items-start gap-4">
                <div className={"font-bold text-lg w-32 shrink-0 " + layer.color}>
                  {layer.layer}
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">JWT vs Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3 border-blue-500/30">
            <h3 className="font-semibold text-blue-500">JWT (Stateless)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Scalable (pas de stockage serveur)</li>
              <li>✅ Microservices-friendly</li>
              <li>⚠️ Difficile à révoquer avant expiration (liste de révocation requise)</li>
              <li>⚠️ Payload visible (signer, ne pas chiffrer les secrets)</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3 border-green-500/30">
            <h3 className="font-semibold text-green-500">Sessions (Stateful)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Révocable immédiatement</li>
              <li>✅ Données sensibles côté serveur</li>
              <li>⚠️ Nécessite stockage centralisé (Redis)</li>
              <li>⚠️ Problème de sticky sessions si mal configuré</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
