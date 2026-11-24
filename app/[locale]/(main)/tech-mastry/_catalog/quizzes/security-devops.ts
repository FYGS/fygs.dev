import type { AreaQuizzes } from "./types";

export const securityDevopsQuizzes: AreaQuizzes = {
  "/tech-mastry/security-devops/owasp-top-10": [
    {
      id: "security-devops-owasp-top-10-1",
      question:
        "Une API exige un token valide, puis renvoie le profil de n'importe quel id demandé dans GET /api/users/:id. Quelle est la faille et la correction ?",
      options: [
        "Broken Access Control (IDOR) : vérifier côté serveur que l'appelant est propriétaire de la ressource ou admin, sinon 403",
        "Injection : échapper les caractères spéciaux de l'identifiant avant la requête SQL et utiliser des identifiants numériques plutôt que des UUID pour éviter toute ambiguïté",
        "Cryptographic Failures : chiffrer l'identifiant dans l'URL pour le rendre imprévisible",
        "Aucune faille, puisque l'utilisateur est authentifié avant d'accéder à l'endpoint",
      ],
      correctIndex: 0,
      explanation:
        "L'authentification prouve qui est l'appelant, pas qu'il a le droit de lire cette ressource. Masquer ou chiffrer l'id n'est pas un contrôle d'accès : la vérification d'autorisation doit se faire sur chaque requête.",
      difficulty: "easy",
    },
    {
      id: "security-devops-owasp-top-10-2",
      question:
        "Quelle façon de stocker les mots de passe est correcte ?",
      options: [
        "Les chiffrer en AES avec une clé en variable d'environnement, pour pouvoir les récupérer",
        "Les hacher avec MD5 et un sel global identique pour tous les utilisateurs",
        "Les hacher avec bcrypt (coût 12) ou Argon2, chaque hash intégrant son propre sel",
        "Les encoder en base64 pour qu'ils ne soient pas lisibles en clair dans la base",
      ],
      correctIndex: 2,
      explanation:
        "Un mot de passe ne doit jamais pouvoir être récupéré : on stocke un hash lent et salé. Le chiffrement réversible expose tout si la clé fuit, MD5 est bien trop rapide, et base64 n'est qu'un encodage.",
      difficulty: "easy",
    },
    {
      id: "security-devops-owasp-top-10-3",
      question:
        "Pour parer l'injection SQL, un développeur écrit :\nconst safe = email.replace(/'/g, '');\nconst q = `SELECT * FROM users WHERE email = '${safe}'`;\nPourquoi est-ce insuffisant ?",
      options: [
        "Parce que replace est trop lent pour être utilisé sur des entrées utilisateur, ce qui ouvrirait la porte à un déni de service",
        "Le filtrage par liste noire se contourne ; seule la paramétrisation sépare le code SQL des données",
        "Parce que le SQL n'est vulnérable que lorsque la requête contient un mot de passe",
        "Parce qu'il faudrait aussi supprimer les espaces de la valeur, ce qui suffirait",
      ],
      correctIndex: 1,
      explanation:
        "Retirer quelques caractères suppose d'avoir tout prévu. Une requête paramétrée envoie la structure SQL et les valeurs séparément, donc la donnée n'est jamais interprétée comme du code, quel que soit son contenu.",
      difficulty: "medium",
    },
    {
      id: "security-devops-owasp-top-10-4",
      question:
        "Une application permet aux utilisateurs de publier du HTML riche (gras, liens). Quelle approche est la plus sûre ?",
      options: [
        "Supprimer les balises <script> avec une expression régulière avant l'affichage, puis stocker le résultat nettoyé directement dans la base de données",
        "Convertir le contenu en base64 avant de l'insérer dans la page",
        "Valider le contenu en JavaScript dans le navigateur de l'auteur avant l'envoi",
        "Assainir avec une bibliothèque à liste blanche (DOMPurify), n'injecter que le résultat et ajouter une CSP",
      ],
      correctIndex: 3,
      explanation:
        "Les attributs d'événement (onerror), les URL javascript: et les contextes imbriqués échappent aux regex. La validation côté client n'est pas un contrôle de sécurité, car un attaquant envoie directement sa requête au serveur.",
      difficulty: "medium",
    },
    {
      id: "security-devops-owasp-top-10-5",
      question:
        "Une application React n'utilise jamais dangerouslySetInnerHTML. Un XSS reste-t-il possible ?",
      options: [
        "Non, React rend le XSS impossible quelle que soit la façon d'afficher les données, car il échappe tout ce qu'il manipule, y compris les URL et les attributs",
        "Non, à condition que le site soit servi en HTTPS avec HSTS",
        "Oui, par exemple via href={urlUtilisateur} avec javascript:, ou un innerHTML manuel ou une bibliothèque tierce",
        "Oui, mais uniquement si les cookies de session ne sont pas HttpOnly",
      ],
      correctIndex: 2,
      explanation:
        "L'échappement automatique ne protège que le contenu texte rendu par JSX. Les URL, les refs avec innerHTML et les composants tiers restent des vecteurs. HttpOnly limite le vol de cookie, il n'empêche pas l'exécution du script.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/security-devops/cicd": [
    {
      id: "security-devops-cicd-1",
      question:
        "Dans le pipeline, les jobs lint, test, security et build sont reliés par des clauses `needs`. Quel est l'intérêt principal ?",
      options: [
        "Ils partagent ainsi le même système de fichiers et réutilisent les fichiers produits d'un job à l'autre sans avoir à les republier",
        "Chaque job attend le précédent : un échec en amont arrête la chaîne avant le build et le déploiement",
        "Ils s'exécutent tous en parallèle pour réduire la durée totale du pipeline",
        "GitHub Actions impose needs sur chaque job, sans quoi le workflow est invalide",
      ],
      correctIndex: 1,
      explanation:
        "needs ordonne les jobs et saute ceux qui dépendent d'un job en échec, ce qui fait échouer vite sans déployer un build non validé. Les jobs ne partagent pas de système de fichiers, et sans needs ils tournent en parallèle.",
      difficulty: "easy",
    },
    {
      id: "security-devops-cicd-2",
      question:
        "L'image Docker est poussée avec le tag `ghcr.io/org/app:${{ github.sha }}`. Quel avantage cela procure-t-il par rapport à un tag unique comme latest ?",
      options: [
        "L'image est automatiquement signée et vérifiée par GitHub",
        "Le registre peut compresser davantage les couches de l'image car le SHA change moins souvent qu'un numéro de version",
        "L'image est plus petite car le SHA remplace les métadonnées du build",
        "Chaque image est liée à un commit précis : on trace ce qui tourne et on peut revenir à une version exacte",
      ],
      correctIndex: 3,
      explanation:
        "Un tag immuable par commit rend les déploiements et les rollbacks déterministes. Latest change à chaque build et ne dit pas quel code est en cours d'exécution ; le tag n'a aucun effet sur la taille ni sur la signature.",
      difficulty: "easy",
    },
    {
      id: "security-devops-cicd-3",
      question:
        "Le workflow utilise `uses: aquasecurity/trivy-action@master`. Quel risque cela comporte-t-il ?",
      options: [
        "Le code de l'action peut changer ou être compromis sans prévenir ; épinglez une version ou un SHA",
        "L'action ne fonctionne que sur la branche main du dépôt",
        "Les secrets du dépôt sont affichés en clair dans les logs de l'action dès que la branche master reçoit un nouveau commit sur le dépôt de l'éditeur",
        "Le scan s'exécute deux fois, ce qui double la durée du job",
      ],
      correctIndex: 0,
      explanation:
        "Une branche flottante exécute n'importe quel code poussé demain dans votre pipeline, avec accès à vos secrets : c'est un risque de supply chain. Un SHA complet est le plus sûr, car un tag de version peut lui aussi être déplacé.",
      difficulty: "medium",
    },
    {
      id: "security-devops-cicd-4",
      question:
        "Le job deploy-production est déclaré avec `environment: production`. Que cela apporte-t-il concrètement ?",
      options: [
        "Création automatique d'un cluster Kubernetes de production dès que le job est lancé pour la première fois sur la branche main",
        "Chiffrement des logs du job avant leur stockage",
        "Des règles de protection (approbation manuelle, branches) et des secrets propres à cet environnement",
        "Un temps d'exécution réduit grâce à des runners prioritaires",
      ],
      correctIndex: 2,
      explanation:
        "Les environments GitHub servent à contrôler le déploiement : relecteurs requis, restrictions de branche, secrets distincts de ceux de staging. Ils ne provisionnent aucune infrastructure.",
      difficulty: "medium",
    },
    {
      id: "security-devops-cicd-5",
      question:
        "Le job security lance trivy-action avec `scan-type: 'fs'` et `severity: 'HIGH,CRITICAL'`, sans autre option. Une CVE critique existe pourtant et le job reste vert. Pourquoi, et que faire ?",
      options: [
        "Le scan fs ignore les lockfiles ; seul scan-type image détecte des CVE",
        "La clause needs n'attend pas la fin du job de sécurité ; il faut la retirer",
        "Un job de scan ne peut jamais bloquer un pipeline, il ne produit qu'un rapport consultable dans l'onglet Security du dépôt, sans jamais interrompre les jobs suivants",
        "Par défaut l'action sort avec le code 0 même avec des CVE ; il faut exit-code: '1' pour faire échouer le job",
      ],
      correctIndex: 3,
      explanation:
        "Le filtre severity sélectionne ce qui est rapporté, mais le code de sortie de trivy-action vaut 0 par défaut. Avec exit-code à 1, la détection échoue le job et needs empêche le build. Le scan fs analyse bien les lockfiles.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/security-devops/docker-kubernetes": [
    {
      id: "security-devops-docker-kubernetes-1",
      question:
        "Quelle différence fondamentale sépare un conteneur d'une machine virtuelle ?",
      options: [
        "Un conteneur embarque son propre noyau, ce qui le rend plus lourd et plus isolé, exactement comme le fait une machine virtuelle",
        "Une VM partage le noyau de l'hôte alors qu'un conteneur virtualise le matériel",
        "Un conteneur partage le noyau de l'hôte : plus léger et plus rapide à démarrer, mais moins isolé qu'une VM",
        "Un conteneur ne peut pas être limité en CPU ou en mémoire, contrairement à une VM",
      ],
      correctIndex: 2,
      explanation:
        "Les conteneurs reposent sur les namespaces et cgroups du noyau hôte, d'où leur légèreté et leur isolation plus faible. C'est la VM qui virtualise le matériel et embarque son propre noyau ; CPU et mémoire se limitent via les cgroups.",
      difficulty: "easy",
    },
    {
      id: "security-devops-docker-kubernetes-2",
      question:
        "Pourquoi le Dockerfile copie-t-il package.json et pnpm-lock.yaml, installe les dépendances, puis seulement ensuite copie le reste du code ?",
      options: [
        "Les dépendances ne sont réinstallées que si le lockfile change, grâce au cache de couches",
        "Le code source ne peut pas être copié avant l'installation, sinon le build échoue, car pnpm refuse de s'exécuter si des fichiers inconnus sont présents",
        "pnpm exige que le lockfile soit seul dans l'image au moment de l'installation",
        "Cela évite d'avoir à utiliser un build multi-stage",
      ],
      correctIndex: 0,
      explanation:
        "Docker réutilise une couche tant que ses entrées sont identiques. Le lockfile change rarement, le code souvent : placer l'installation avant COPY . . garde l'installation en cache. Cela n'a aucun lien avec le multi-stage.",
      difficulty: "easy",
    },
    {
      id: "security-devops-docker-kubernetes-3",
      question:
        "Une équipe déploie son API comme un Pod nu. Le nœud qui l'héberge tombe en panne. Que se passe-t-il, et que faire ?",
      options: [
        "Kubernetes recrée automatiquement le Pod sur un autre nœud, aucune action requise, grâce au scheduler qui surveille en permanence tous les Pods du cluster",
        "Un Service recrée le Pod, car il porte la définition des réplicas",
        "Un HPA recrée le Pod en détectant la charge CPU nulle",
        "Rien ne recrée le Pod ; utilisez un Deployment, qui maintient les réplicas et gère rolling update et rollback",
      ],
      correctIndex: 3,
      explanation:
        "Un Pod isolé n'est géré par aucun contrôleur et disparaît avec son nœud. Le Deployment (via un ReplicaSet) maintient l'état désiré. Un Service ne fait qu'exposer des Pods, et le HPA ajuste un nombre de réplicas existant.",
      difficulty: "medium",
    },
    {
      id: "security-devops-docker-kubernetes-4",
      question:
        "Les Pods de l'API changent d'adresse IP à chaque redéploiement. Comment les autres services peuvent-ils les joindre de façon stable ?",
      options: [
        "En codant en dur les adresses IP des Pods dans un ConfigMap et en le mettant à jour à chaque déploiement avec un script",
        "Via un Service qui sélectionne les Pods par labels et offre une IP et un nom DNS stables",
        "Via un HPA, qui réattribue la même IP à chaque nouveau Pod",
        "Via un Ingress, qui fixe l'adresse IP interne de chaque Pod",
      ],
      correctIndex: 1,
      explanation:
        "Un Service est une abstraction réseau stable devant des Pods éphémères et répartit la charge entre eux. L'Ingress route le trafic HTTP externe vers les Services, et le HPA ne gère que le nombre de réplicas.",
      difficulty: "medium",
    },
    {
      id: "security-devops-docker-kubernetes-5",
      question:
        "Par défaut, comment un objet Secret Kubernetes est-il stocké dans etcd ?",
      options: [
        "Encodé en base64, sans chiffrement : il faut activer le chiffrement au repos et restreindre le RBAC",
        "Chiffré en AES-256 avec une clé générée par le cluster à l'installation et stockée dans le fichier kubeconfig de l'administrateur du cluster",
        "Haché avec bcrypt, ce qui le rend irréversible même pour les administrateurs",
        "Stocké uniquement en mémoire sur le nœud, sans aucune écriture dans etcd",
      ],
      correctIndex: 0,
      explanation:
        "Base64 est un encodage réversible, pas une protection. Sans EncryptionConfiguration (ou un KMS) et un RBAC strict, quiconque lit etcd ou a le droit get sur les Secrets obtient les valeurs.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/security-devops/cloud-native": [
    {
      id: "security-devops-cloud-native-1",
      question:
        "Selon le facteur III (Config) des 12 facteurs, où doit vivre la configuration qui varie entre staging et production ?",
      options: [
        "Dans un fichier config.prod.json versionné avec le code",
        "Dans des constantes du code, choisies selon le nom de la branche Git courante au moment du build de l'image de production",
        "Dans l'image Docker, avec une image distincte par environnement",
        "Dans l'environnement du déploiement (variables d'environnement), hors du code et de l'artefact",
      ],
      correctIndex: 3,
      explanation:
        "Le même artefact doit pouvoir être promu d'un environnement à l'autre, seule la configuration changeant. Une image ou un code propre à chaque environnement rend la production non reproductible et expose des secrets dans le dépôt.",
      difficulty: "easy",
    },
    {
      id: "security-devops-cloud-native-2",
      question:
        "Selon le facteur VI (Processes), où stocker les sessions utilisateur d'une application scalée horizontalement ?",
      options: [
        "En mémoire du processus, avec des sticky sessions sur le load balancer, pour que chaque utilisateur retrouve toujours la même instance",
        "Dans un service attaché (Redis, base), car une instance peut être arrêtée ou remplacée à tout moment",
        "Sur le disque local du conteneur, dans un dossier de sessions",
        "Dans une variable globale partagée entre les requêtes de l'instance",
      ],
      correctIndex: 1,
      explanation:
        "Des processus sans état peuvent être multipliés ou détruits librement, car l'état vit dans un backing service. La mémoire ou le disque local sont perdus au redémarrage, et les sticky sessions limitent la souplesse du scaling.",
      difficulty: "easy",
    },
    {
      id: "security-devops-cloud-native-3",
      question:
        "Kubernetes envoie SIGTERM à un Pod avant de l'arrêter. Que doit faire une application respectueuse du facteur IX (Disposability) ?",
      options: [
        "Ignorer le signal et continuer à tourner jusqu'au SIGKILL",
        "S'arrêter immédiatement, en abandonnant les requêtes en cours pour libérer vite le nœud, ce qui est préférable car cela raccourcit la durée de chaque mise à jour",
        "Cesser d'accepter de nouvelles connexions, finir les requêtes en cours puis quitter avant le délai de grâce",
        "Redémarrer son serveur HTTP pour recharger sa configuration",
      ],
      correctIndex: 2,
      explanation:
        "Un arrêt gracieux évite de couper des requêtes lors des mises à jour et du scaling. Si l'application ne s'arrête pas avant le délai de grâce, Kubernetes envoie SIGKILL et les requêtes restantes sont perdues.",
      difficulty: "medium",
    },
    {
      id: "security-devops-cloud-native-4",
      question:
        "Parmi ces charges, laquelle convient le mieux à une exécution serverless ?",
      options: [
        "Un traitement de webhooks de paiement reçus quelques fois par heure, avec des pics imprévisibles",
        "Un serveur WebSocket maintenant 50 000 connexions ouvertes en continu",
        "Un encodage vidéo de plusieurs heures par fichier",
        "Une API de trading qui garantit une latence constante de quelques millisecondes pour chaque requête, y compris juste après une période d'inactivité",
      ],
      correctIndex: 0,
      explanation:
        "Le serverless s'adapte aux charges événementielles et irrégulières, facturées à l'usage. Les connexions longues, les calculs lourds et les latences critiques (cold start) en sont les cas défavorables.",
      difficulty: "medium",
    },
    {
      id: "security-devops-cloud-native-5",
      question:
        "Le facteur V sépare Build, Release et Run. Pourquoi est-il déconseillé de modifier le code directement sur le serveur de production ?",
      options: [
        "Parce que le build est trop lent pour être relancé en production, ce qui bloquerait le trafic des utilisateurs pendant plusieurs minutes à chaque correctif",
        "Une release immuable (build + config) est identifiable et rollbackable ; un changement à chaud rend l'état non reproductible",
        "Parce que le runtime ne permet pas de recharger des fichiers modifiés",
        "Parce que les modifications à chaud sont systématiquement refusées par Kubernetes",
      ],
      correctIndex: 1,
      explanation:
        "Une release est la combinaison d'un build et d'une configuration, versionnée, que l'on peut redéployer ou annuler. Un correctif manuel sur le serveur crée une dérive que personne ne peut reproduire ni retrouver.",
      difficulty: "hard",
    },
  ],
};
