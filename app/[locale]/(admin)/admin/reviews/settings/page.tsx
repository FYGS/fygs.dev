import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Shield, 
  AlertCircle, 
  Users, 
  MessageSquare,
  Filter,
  Ban,
  CheckCircle,
  Clock
} from "lucide-react";

export default async function AdminReviewsSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/unauthorized");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres des avis</h1>
          <p className="text-muted-foreground mt-2">
            Configuration et règles de modération des avis étudiants
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Sauvegarder les modifications
        </Button>
      </div>

      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="moderation">Modération</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Moderation Settings */}
        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Moderation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Modération générale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Approbation automatique
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les avis sont publiés automatiquement
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Modération préalable
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tous les avis nécessitent une approbation
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Avis anonymes autorisés
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permettre les avis sans nom d&apos;utilisateur
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Note minimale requise
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Aucune restriction</option>
                    <option>1 étoile minimum</option>
                    <option>2 étoiles minimum</option>
                    <option>3 étoiles minimum</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Longueur minimale du commentaire
                  </label>
                  <input 
                    type="number" 
                    defaultValue="10"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Nombre de caractères"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Filtering */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Filtrage de contenu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Détection de spam
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bloquer automatiquement le contenu suspect
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Filtrage profanité
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Censurer le langage inapproprié
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Détection de doublons
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Éviter les avis identiques ou similaires
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mots-clés interdits
                  </label>
                  <textarea 
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Mots ou expressions séparés par des virgules"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    URLs externes autorisées
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Interdites</option>
                    <option>Autorisées avec modération</option>
                    <option>Autorisées</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* User Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Restrictions utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Inscription requise
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seuls les utilisateurs inscrits peuvent commenter
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Achat requis
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      L&apos;utilisateur doit avoir acheté la formation
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Délai avant avis (jours)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="1"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Nombre de jours après l'achat"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Limite d&apos;avis par utilisateur
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>1 avis par formation</option>
                    <option>1 avis par mois</option>
                    <option>3 avis par mois</option>
                    <option>Illimité</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Niveau minimum requis
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Aucune restriction</option>
                    <option>Compte vérifié</option>
                    <option>Au moins 1 formation complétée</option>
                    <option>Au moins 3 formations complétées</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Actions sur les avis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Modification autorisée
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les utilisateurs peuvent modifier leurs avis
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Délai de modification (heures)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="24"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Suppression autorisée
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les utilisateurs peuvent supprimer leurs avis
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Signalement activé
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permettre de signaler des avis inappropriés
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Seuil de signalements
                  </label>
                  <input 
                    type="number" 
                    defaultValue="3"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Nombre de signalements avant modération"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Settings */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approbation automatique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-200">
                    <strong>Règles d&apos;auto-approbation :</strong> Les avis qui respectent tous les critères sont automatiquement approuvés.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Note ≥ 3 étoiles</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commentaire ≥ 20 caractères</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Utilisateur vérifié</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pas de mots interdits</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  Rejet automatique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-200">
                    <strong>Règles d&apos;auto-rejet :</strong> Les avis qui déclenchent ces règles sont automatiquement rejetés.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contient des profanités</span>
                    <Badge variant="destructive">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Spam détecté</span>
                    <Badge variant="destructive">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contenu dupliqué</span>
                    <Badge variant="destructive">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Liens externes suspects</span>
                    <Badge variant="destructive">Actif</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  File d&apos;attente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    <strong>Modération manuelle :</strong> Ces avis nécessitent une vérification humaine.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Note = 1 étoile</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commentaire très long ({'>'}500 chars)</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nouvel utilisateur</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mots-clés sensibles</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configuration IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Analyse de sentiment
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Classifier automatiquement le ton des avis
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Seuil de confiance IA
                  </label>
                  <input 
                    type="range" 
                    min="0.5"
                    max="1"
                    step="0.1"
                    defaultValue="0.8"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Permissif</span>
                    <span>80%</span>
                    <span>Strict</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Détection de langue
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vérifier que l&apos;avis est en français
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications modérateurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nouvel avis en attente</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avis signalé</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Seuil de signalements atteint</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Spam détecté</span>
                  <input type="checkbox" className="toggle" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avis approuvé</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avis rejeté</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Réponse à l&apos;avis</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rappel d&apos;évaluation</span>
                  <input type="checkbox" className="toggle" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Settings */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rôles et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Administrateurs</h4>
                  <div className="pl-4 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Modérer tous les avis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Configurer les paramètres
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Accéder aux analytics
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Instructeurs</h4>
                  <div className="pl-4 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Voir les avis de leurs formations
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Répondre aux avis
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      Signaler des avis inappropriés
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Étudiants</h4>
                  <div className="pl-4 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Laisser des avis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Modifier leurs avis (24h)
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Signaler des avis
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restrictions par statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Compte suspendu</h4>
                  <div className="pl-4 space-y-1 text-sm text-red-600">
                    <div className="flex items-center gap-2">
                      <Ban className="h-3 w-3" />
                      Aucun avis autorisé
                    </div>
                    <div className="flex items-center gap-2">
                      <Ban className="h-3 w-3" />
                      Avis existants masqués
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Nouveau compte</h4>
                  <div className="pl-4 space-y-1 text-sm text-yellow-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Modération obligatoire
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Max 1 avis par jour
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Compte vérifié</h4>
                  <div className="pl-4 space-y-1 text-sm text-green-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Auto-approbation activée
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Pas de limite d&apos;avis
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}