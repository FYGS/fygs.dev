import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Users, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | FYGS Learning Platform",
  description: "Conditions d'utilisation de la plateforme d'apprentissage FYGS",
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <FileText className="w-4 h-4 mr-2" />
          Conditions d&apos;utilisation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Conditions d&apos;utilisation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              1. Acceptation des conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              En accédant et en utilisant la plateforme FYGS Learning Platform, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
            <p className="text-muted-foreground">
              Ces conditions s&apos;appliquent à tous les utilisateurs de la plateforme, y compris les visiteurs, les étudiants inscrits et les utilisateurs premium.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              2. Description du service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              FYGS Learning Platform est une plateforme d&apos;apprentissage en ligne qui propose des formations en développement web moderne, incluant :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Formations vidéo interactives</li>
              <li>Exercices pratiques et projets</li>
              <li>Suivi de progression personnalisé</li>
              <li>Certificats de completion</li>
              <li>Support communautaire</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              3. Comptes utilisateur et accès
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Création de compte</h4>
                <p className="text-muted-foreground">
                  Pour accéder à certaines fonctionnalités, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de maintenir la confidentialité de vos identifiants.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2 Éligibilité</h4>
                <p className="text-muted-foreground">
                  Vous devez avoir au moins 16 ans pour utiliser ce service. Si vous avez entre 16 et 18 ans, vous devez obtenir l&apos;autorisation parentale.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.3 Utilisation acceptable</h4>
                <p className="text-muted-foreground">
                  Vous vous engagez à utiliser la plateforme uniquement à des fins légales et conformément à ces conditions. Il est interdit de partager vos identifiants ou d&apos;accéder illégalement au contenu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Contenu et propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Propriété du contenu</h4>
                <p className="text-muted-foreground">
                  Tout le contenu de la plateforme (vidéos, textes, exercices, code source) est protégé par le droit d&apos;auteur et appartient à FYGS ou à ses partenaires.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2 Licence d&apos;utilisation</h4>
                <p className="text-muted-foreground">
                  Nous vous accordons une licence limitée, non-exclusive et non-transférable pour accéder au contenu à des fins d&apos;apprentissage personnel uniquement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.3 Restrictions</h4>
                <p className="text-muted-foreground">
                  Il est strictement interdit de copier, distribuer, revendre ou utiliser le contenu à des fins commerciales sans autorisation écrite.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Paiements et remboursements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 Tarification</h4>
                <p className="text-muted-foreground">
                  Les prix sont indiqués en euros TTC. Nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5.2 Politique de remboursement</h4>
                <p className="text-muted-foreground">
                  Vous disposez de 14 jours pour demander un remboursement complet si vous n&apos;êtes pas satisfait, à condition de ne pas avoir terminé plus de 20% du contenu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Limitation de responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              FYGS Learning Platform est fourni &quot;en l&apos;état&quot;. Nous ne garantissons pas que le service sera ininterrompu ou exempt d&apos;erreurs. Notre responsabilité est limitée au montant payé pour le service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Modifications des conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email avec un préavis de 30 jours.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pour toute question concernant ces conditions d&apos;utilisation, contactez-nous à :
            </p>
            <div className="mt-4 space-y-2">
              <p className="font-medium">Email : fygs.dev@gmail.com</p>
              <p className="font-medium">Adresse : France</p>
            </div>
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
