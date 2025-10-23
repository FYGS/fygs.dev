import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, Mail, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité | FYGS Learning Platform",
  description: "Politique de confidentialité de la plateforme d'apprentissage FYGS",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Shield className="w-4 h-4 mr-2" />
          Politique de confidentialité
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Chez FYGS Learning Platform, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
            <p className="text-muted-foreground">
              Cette politique s&apos;applique à tous les services fournis par FYGS Learning Platform et est conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              2. Données que nous collectons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 Informations d&apos;identification</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Photo de profil (optionnelle)</li>
                  <li>Informations de connexion via réseaux sociaux</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2 Données d&apos;apprentissage</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Progression dans les cours</li>
                  <li>Résultats aux exercices et quiz</li>
                  <li>Temps passé sur la plateforme</li>
                  <li>Préférences d&apos;apprentissage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.3 Données techniques</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et système d&apos;exploitation</li>
                  <li>Pages visitées et durée des sessions</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              3. Comment nous utilisons vos données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Fourniture du service</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Fournir l&apos;accès aux formations et contenus</li>
                  <li>Suivre votre progression d&apos;apprentissage</li>
                  <li>Délivrer des certificats de completion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2 Amélioration du service</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Analyser l&apos;utilisation de la plateforme</li>
                  <li>Personnaliser votre expérience d&apos;apprentissage</li>
                  <li>Développer de nouvelles fonctionnalités</li>
                  <li>Résoudre les problèmes techniques</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.3 Communication</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Envoyer des notifications importantes</li>
                  <li>Répondre à vos questions et demandes</li>
                  <li>Informer des nouvelles formations (avec votre consentement)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              4. Cookies et technologies de suivi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Types de cookies</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance :</strong> Analysent l&apos;utilisation du site</li>
                  <li><strong>Cookies de préférences :</strong> Mémorisent vos paramètres</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2 Gestion des cookies</h4>
                <p className="text-muted-foreground">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur. Notez que désactiver certains cookies peut affecter le fonctionnement de la plateforme.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Partage des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Avec votre consentement explicite</li>
              <li>Avec nos prestataires de services (hébergement, paiement, analytics)</li>
              <li>Pour respecter nos obligations légales</li>
              <li>Pour protéger nos droits et ceux de nos utilisateurs</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Sécurité des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nous mettons en place des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Chiffrement des données en transit et au repos</li>
              <li>Authentification sécurisée et gestion des accès</li>
              <li>Surveillance continue et détection des intrusions</li>
              <li>Sauvegardes régulières et plan de récupération</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Vos droits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Droit d&apos;accès</h4>
                <p className="text-sm text-muted-foreground">Consulter vos données personnelles</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Droit de rectification</h4>
                <p className="text-sm text-muted-foreground">Corriger vos informations</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Droit à l&apos;effacement</h4>
                <p className="text-sm text-muted-foreground">Supprimer vos données</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Droit à la portabilité</h4>
                <p className="text-sm text-muted-foreground">Récupérer vos données</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Conservation des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Données de compte :</strong> Tant que votre compte est actif</li>
              <li><strong>Données d&apos;apprentissage :</strong> 3 ans après la dernière activité</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligations légales)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              9. Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Pour exercer vos droits ou pour toute question concernant cette politique de confidentialité :
            </p>
            <div className="space-y-2">
              <p className="font-medium">Email : fygs.dev@gmail.com</p>
              <p className="font-medium">Objet : &quot;Protection des données&quot;</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Nous nous engageons à répondre à vos demandes dans un délai de 30 jours.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} FYGS Learning Platform. Tous droits réservés.</p>
      </div>
    </div>
  );
}
