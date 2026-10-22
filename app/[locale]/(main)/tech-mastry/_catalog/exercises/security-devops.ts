import type { AreaExercises } from "./types";

export const securityDevopsExercises: AreaExercises = {
  "/tech-mastry/security-devops/owasp-top-10": [
    {
      id: "security-devops-owasp-top-10-match-1",
      type: "match",
      prompt: "Associez chaque catégorie de l'OWASP Top 10 2021 à ce qu'elle recouvre.",
      pairs: [
        { term: "A01 Broken Access Control", definition: "Accéder au profil d'un autre utilisateur faute de contrôle d'autorisation" },
        { term: "A02 Cryptographic Failures", definition: "Mots de passe en clair ou chiffrement faible des données sensibles" },
        { term: "A03 Injection", definition: "Données non fiables interprétées comme du code (SQL, XSS)" },
        { term: "A05 Security Misconfiguration", definition: "Configuration par défaut, en-têtes manquants, erreurs trop verbeuses" },
        { term: "A06 Vulnerable and Outdated Components", definition: "Dépendances contenant des CVE connues et non mises à jour" },
        { term: "A07 Identification and Authentication Failures", definition: "Mots de passe faibles ou gestion de session défaillante" },
      ],
      explanation:
        "Depuis 2021, le XSS est rattaché à A03 Injection, et A07 désigne les défaillances d'identification et d'authentification. Broken Access Control est passé en tête du classement.",
    },
    {
      id: "security-devops-owasp-top-10-classify-1",
      type: "classify",
      prompt: "Classez ces extraits selon qu'ils sont vulnérables ou sûrs.",
      categories: ["Vulnérable", "Sûr"],
      items: [
        { text: "SELECT * FROM users WHERE email = '${email}'", category: 0 },
        { text: "prisma.user.findUnique({ where: { email } })", category: 1 },
        { text: "element.innerHTML = userInput", category: 0 },
        { text: "<p>{text}</p> dans un composant React", category: 1 },
        { text: "db.user.create({ data: { email, password } }) avec le mot de passe en clair", category: 0 },
        { text: "bcrypt.hash(password, 12) avant l'enregistrement", category: 1 },
        { text: "app.get('/api/users/:id') qui renvoie n'importe quel profil", category: 0 },
        { text: "Renvoyer 403 si req.user.id !== req.params.id et non admin", category: 1 },
      ],
      explanation:
        "Chaque cas vulnérable laisse une donnée non maîtrisée atteindre un interpréteur, ou omet un contrôle côté serveur. Les variantes sûres paramètrent, échappent, hachent ou vérifient les droits.",
    },
    {
      id: "security-devops-owasp-top-10-fill-1",
      type: "fill",
      prompt: "Complétez ces deux protections : contrôle d'accès à l'inscription et hachage du mot de passe.",
      code: "if (req.user.id !== req.params.id && !req.user.{{1}}) {\n  return res.status({{2}}).json({ error: 'Forbidden' });\n}\n// à l'inscription\nconst hash = await bcrypt.{{3}}(password, 12);",
      blanks: [
        { options: ["isAdmin", "name", "email"], answer: 0 },
        { options: ["200", "403", "500"], answer: 1 },
        { options: ["compare", "hash", "verify"], answer: 1 },
      ],
      explanation:
        "Seul le propriétaire ou un admin passe, sinon 403 (identifié mais interdit). bcrypt.hash produit l'empreinte à stocker ; compare ne sert qu'à la connexion.",
    },
  ],
  "/tech-mastry/security-devops/cicd": [
    {
      id: "security-devops-cicd-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes du pipeline GitHub Actions.",
      steps: [
        "Push ou pull request : le workflow se déclenche",
        "Lint du code",
        "Tests unitaires et end-to-end",
        "Scan de sécurité des dépendances et du code (Trivy)",
        "Build et push de l'image Docker taguée avec le SHA",
        "Déploiement en staging et smoke tests",
        "Déploiement en production",
      ],
      explanation:
        "Le pipeline va du moins coûteux au plus coûteux pour échouer vite, et rien n'est construit ni déployé tant que les contrôles n'ont pas réussi.",
    },
    {
      id: "security-devops-cicd-fill-1",
      type: "fill",
      prompt: "Complétez ce workflow : action de scan épinglée, échec du job en cas de CVE, et déploiement protégé par un environnement.",
      code: "security:\n  steps:\n    - uses: aquasecurity/trivy-action@{{1}}\n      with:\n        severity: 'HIGH,CRITICAL'\n        exit-code: '{{2}}'\ndeploy:\n  needs: security\n  {{3}}: production",
      blanks: [
        { options: ["master", "main", "un SHA de commit complet"], answer: 2 },
        { options: ["0", "1", "HIGH"], answer: 1 },
        { options: ["environment", "env", "stage"], answer: 0 },
      ],
      explanation:
        "Un SHA fige le code de l'action (supply chain). exit-code 1 fait échouer le job quand une vulnérabilité est trouvée, alors que 0 est le défaut. La clé environment active les règles de protection.",
    },
    {
      id: "security-devops-cicd-classify-1",
      type: "classify",
      prompt: "Classez ces pratiques de pipeline selon qu'elles sont sûres ou risquées.",
      categories: ["Sûr", "Risqué"],
      items: [
        { text: "uses: aquasecurity/trivy-action@master", category: 1 },
        { text: "Action tierce épinglée sur un SHA de commit complet", category: 0 },
        { text: "env: SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}", category: 0 },
        { text: "Token d'API écrit en clair dans le fichier YAML", category: 1 },
        { text: "Image taguée avec github.sha", category: 0 },
        { text: "Image publiée uniquement avec le tag latest", category: 1 },
      ],
      explanation:
        "Les références mutables (branche, latest) rendent le pipeline imprévisible et vulnérable à la compromission d'une dépendance. Les secrets vivent dans le coffre de GitHub, jamais dans le dépôt.",
    },
  ],
  "/tech-mastry/security-devops/docker-kubernetes": [
    {
      id: "security-devops-docker-kubernetes-match-1",
      type: "match",
      prompt: "Associez chaque ressource Kubernetes à son rôle.",
      pairs: [
        { term: "Pod", definition: "Plus petite unité déployable : un ou plusieurs conteneurs au réseau partagé" },
        { term: "Deployment", definition: "Maintient les réplicas et gère rolling updates et rollbacks" },
        { term: "Service", definition: "Point d'accès réseau stable devant des Pods éphémères" },
        { term: "Ingress", definition: "Routage HTTP/HTTPS externe vers les Services, avec terminaison TLS" },
        { term: "ConfigMap", definition: "Configuration non sensible externalisée de l'image" },
        { term: "HPA", definition: "Ajuste automatiquement le nombre de Pods selon la charge" },
      ],
      explanation:
        "On n'agit presque jamais sur un Pod directement : le Deployment le gère, le Service l'expose en interne, l'Ingress depuis l'extérieur, et le HPA adapte le nombre de réplicas.",
    },
    {
      id: "security-devops-docker-kubernetes-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les instructions d'un Dockerfile multi-stage optimisé pour le cache.",
      steps: [
        "FROM node:20-alpine AS builder",
        "COPY package.json pnpm-lock.yaml ./",
        "RUN pnpm install --frozen-lockfile",
        "COPY . . puis RUN pnpm build",
        "FROM node:20-alpine AS runner (nouvelle image minimale)",
        "COPY --from=builder du seul résultat du build",
        "USER app puis CMD du serveur",
      ],
      explanation:
        "Le lockfile est copié avant le code pour que l'installation reste en cache tant que les dépendances ne changent pas. L'image finale ne reprend que le résultat du build et tourne sans privilèges.",
    },
    {
      id: "security-devops-docker-kubernetes-fill-1",
      type: "fill",
      prompt: "Complétez ces commandes kubectl : mise à jour de l'image, attente de la fin du déploiement, puis retour arrière en cas d'échec.",
      code: "kubectl {{1}} image deployment/app app=registry/app:abc123\nkubectl rollout {{2}} deployment/app   # attend la fin du déploiement\nkubectl rollout {{3}} deployment/app   # revient à la révision précédente",
      blanks: [
        { options: ["apply", "set", "create"], answer: 1 },
        { options: ["status", "history", "pause"], answer: 0 },
        { options: ["undo", "status", "restart"], answer: 0 },
      ],
      explanation:
        "kubectl set image change l'image d'un Deployment, rollout status suit l'avancement, et rollout undo restaure la révision précédente. restart relancerait les Pods sans revenir à l'ancienne version.",
    },
  ],
  "/tech-mastry/security-devops/cloud-native": [
    {
      id: "security-devops-cloud-native-match-1",
      type: "match",
      prompt: "Associez chaque facteur de l'application 12-Factor à son principe.",
      pairs: [
        { term: "III – Config", definition: "La configuration vit dans l'environnement, pas dans le code" },
        { term: "IV – Backing Services", definition: "Bases et caches sont des ressources attachées, interchangeables par configuration" },
        { term: "V – Build, Release, Run", definition: "Étapes strictement séparées, avec des releases immuables" },
        { term: "VI – Processes", definition: "Processus sans état, l'état étant dans des services externes" },
        { term: "IX – Disposability", definition: "Démarrage rapide et arrêt gracieux" },
        { term: "XI – Logs", definition: "Les logs sont un flux d'événements écrit sur la sortie standard" },
      ],
      explanation:
        "Ces facteurs rendent l'application remplaçable à tout moment : même artefact partout, état externalisé, instances jetables et logs collectés par la plateforme.",
    },
    {
      id: "security-devops-cloud-native-classify-1",
      type: "classify",
      prompt: "Rangez chaque charge de travail selon qu'elle convient au serverless ou non.",
      categories: ["Bien adapté au serverless", "À éviter en serverless"],
      items: [
        { text: "Traitement d'un upload ou d'un webhook déclenché par un événement", category: 0 },
        { text: "Job CRON nocturne court", category: 0 },
        { text: "API au trafic imprévisible, souvent nul", category: 0 },
        { text: "API de trading avec latence ultra-basse garantie", category: 1 },
        { text: "Serveur WebSocket avec des milliers de connexions longues", category: 1 },
        { text: "Entraînement ML ou encodage vidéo de plusieurs heures", category: 1 },
      ],
      explanation:
        "Le serverless excelle pour les charges courtes, événementielles ou irrégulières. Il souffre des cold starts, des connexions de longue durée et des calculs intensifs, mieux servis par des conteneurs.",
    },
    {
      id: "security-devops-cloud-native-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre l'arrêt gracieux d'une instance à la réception de SIGTERM (facteur Disposability).",
      steps: [
        "Kubernetes envoie SIGTERM au conteneur",
        "L'application cesse d'accepter de nouvelles connexions",
        "Elle termine les requêtes déjà en cours",
        "Elle ferme proprement les connexions à la base et au cache",
        "Elle quitte avant la fin du délai de grâce, sinon SIGKILL",
      ],
      explanation:
        "S'arrêter sur-le-champ coupe des requêtes en vol ; ignorer le signal mène à un SIGKILL brutal. L'arrêt gracieux permet de mettre à jour ou déplacer des instances sans perte.",
    },
  ],
};
