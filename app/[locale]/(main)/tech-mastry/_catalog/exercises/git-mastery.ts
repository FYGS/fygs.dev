import type { AreaExercises } from "./types";

export const gitMasteryExercises: AreaExercises = {
  "/tech-mastry/git-mastery/branching-strategies": [
    {
      id: "git-mastery-branching-strategies-match-1",
      type: "match",
      prompt: "Associez chaque branche de Git Flow à son rôle.",
      pairs: [
        { term: "main", definition: "Code en production" },
        { term: "develop", definition: "Intégration des features" },
        { term: "feature/*", definition: "Développement d'une fonctionnalité" },
        { term: "release/*", definition: "Préparation d'une version" },
        { term: "hotfix/*", definition: "Correction urgente de la production" },
      ],
      explanation:
        "Git Flow répartit les rôles sur cinq types de branches. GitHub Flow n'en garde que deux : main et les feature branches.",
    },
    {
      id: "git-mastery-branching-strategies-classify-1",
      type: "classify",
      prompt: "Pour chaque situation, indiquez la stratégie de branches la mieux adaptée.",
      categories: ["Git Flow", "GitHub Flow", "Trunk-based"],
      items: [
        { text: "Versions planifiées et maintenues en parallèle, équipe nombreuse", category: 0 },
        { text: "SaaS déployé à chaque pull request fusionnée, petite équipe", category: 1 },
        { text: "Intégration quotidienne dans main, code inachevé masqué par des feature flags", category: 2 },
        { text: "Branche release stabilisée avant chaque livraison mensuelle", category: 0 },
        { text: "main toujours déployable, pas de branche develop", category: 1 },
        { text: "Branches très courtes (quelques heures à 1-2 jours)", category: 2 },
      ],
      explanation:
        "Git Flow convient aux releases planifiées, GitHub Flow au déploiement continu simple, le trunk-based pousse l'intégration continue à l'extrême avec des feature flags.",
    },
    {
      id: "git-mastery-branching-strategies-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le cycle d'une modification en GitHub Flow.",
      steps: [
        "Créer une branche depuis main à jour",
        "Committer le travail par petites étapes",
        "Pousser la branche et ouvrir une pull request",
        "Faire relire le code et passer la CI",
        "Fusionner dans main",
        "Déployer main",
      ],
      explanation:
        "On ne fusionne dans main qu'après relecture et CI verte, puisque main doit rester déployable. Le déploiement vient de main, pas de la branche.",
    },
  ],
  "/tech-mastry/git-mastery/advanced-commands": [
    {
      id: "git-mastery-advanced-commands-match-1",
      type: "match",
      prompt: "Associez chaque commande à son effet.",
      pairs: [
        { term: "git cherry-pick <hash>", definition: "Rejoue un commit précis sur la branche courante" },
        { term: "git bisect run", definition: "Cherche automatiquement le commit fautif avec un script" },
        { term: "git reflog", definition: "Journal local des positions de HEAD" },
        { term: "git stash -u", definition: "Met de côté les modifications, fichiers non suivis inclus" },
        { term: "git worktree add", definition: "Ouvre une autre branche dans un dossier séparé" },
      ],
      explanation:
        "Chacune de ces commandes répond à un besoin précis : rejouer, chercher, retrouver, mettre de côté, travailler en parallèle.",
    },
    {
      id: "git-mastery-advanced-commands-classify-1",
      type: "classify",
      prompt: "Classez ces commandes selon qu'elles réécrivent l'historique des commits existants ou non.",
      categories: ["Réécrit l'historique", "Ne réécrit pas l'historique"],
      items: [
        { text: "git rebase -i HEAD~3", category: 0 },
        { text: "git commit --amend", category: 0 },
        { text: "git revert <hash>", category: 1 },
        { text: "git merge feature", category: 1 },
        { text: "git cherry-pick <hash>", category: 1 },
        { text: "git reset --hard HEAD~1", category: 0 },
      ],
      explanation:
        "rebase -i, amend et reset --hard changent ou retirent des commits existants. revert ajoute un commit inverse, merge et cherry-pick ajoutent des commits sans toucher aux anciens.",
    },
    {
      id: "git-mastery-advanced-commands-fill-1",
      type: "fill",
      prompt: "Retrouvez un bug avec une recherche dichotomique automatisée, entre la version v2.0 saine et HEAD.",
      code: "git bisect {{1}}\ngit bisect {{2}}\ngit bisect {{3}} v2.0\ngit bisect run npm test\ngit bisect {{4}}",
      blanks: [
        { options: ["init", "start", "begin"], answer: 1 },
        { options: ["bad", "good", "skip"], answer: 0 },
        { options: ["bad", "skip", "good"], answer: 2 },
        { options: ["stop", "reset", "end", "abort"], answer: 1 },
      ],
      explanation:
        "La session démarre avec start, on marque HEAD comme bad et v2.0 comme good, puis reset termine la session et revient à la branche d'origine.",
    },
  ],
  "/tech-mastry/git-mastery/git-internals": [
    {
      id: "git-mastery-git-internals-match-1",
      type: "match",
      prompt: "Associez chaque objet Git à ce qu'il contient.",
      pairs: [
        { term: "blob", definition: "Le contenu brut d'un fichier, sans son nom" },
        { term: "tree", definition: "Des entrées liant noms et modes à des blobs ou sous-trees" },
        { term: "commit", definition: "Un tree racine, des parents, un auteur et un message" },
        { term: "tag annoté", definition: "Un objet nommé avec tagger, message et cible" },
      ],
      explanation:
        "Le nom d'un fichier vit dans le tree, pas dans le blob. Le commit relie un instantané (tree) à son historique (parents).",
    },
    {
      id: "git-mastery-git-internals-order-1",
      type: "order",
      prompt: "Suivez le chemin de HEAD jusqu'au contenu d'un fichier.",
      steps: [
        "HEAD pointe vers une branche",
        "La branche pointe vers un commit",
        "Le commit pointe vers un tree racine",
        "Le tree racine pointe vers un sous-tree",
        "Le sous-tree pointe vers le blob du fichier",
      ],
      explanation:
        "Pour lire un fichier, Git suit la chaîne référence, commit, tree, blob. C'est ce qu'illustrent git cat-file -p et git ls-tree.",
    },
    {
      id: "git-mastery-git-internals-classify-1",
      type: "classify",
      prompt: "Pour chaque information, indiquez dans quel objet Git elle est stockée.",
      categories: ["Blob", "Tree", "Commit"],
      items: [
        { text: "Les octets d'un fichier", category: 0 },
        { text: "Le nom README.md et son mode 100644", category: 1 },
        { text: "L'auteur et le message", category: 2 },
        { text: "Le hash du ou des parents", category: 2 },
        { text: "La liste des fichiers d'un dossier", category: 1 },
        { text: "Un contenu partagé par deux fichiers identiques", category: 0 },
      ],
      explanation:
        "Contenu dans le blob, structure et noms dans le tree, métadonnées et liens d'historique dans le commit.",
    },
  ],
  "/tech-mastry/git-mastery/workflows": [
    {
      id: "git-mastery-workflows-classify-1",
      type: "classify",
      prompt: "Indiquez l'incrément SemVer que déclenche chaque commit Conventional Commits.",
      categories: ["MAJOR", "MINOR", "PATCH", "Aucun"],
      items: [
        { text: "feat!: drop support for Node 16", category: 0 },
        { text: "feat(auth): add Google OAuth provider", category: 1 },
        { text: "fix(api): resolve race condition in checkout", category: 2 },
        { text: "perf(db): cache frequent queries", category: 2 },
        { text: "docs: update README with deployment instructions", category: 3 },
        { text: "refactor(core): extract helpers", category: 3 },
      ],
      explanation:
        "feat monte le MINOR, fix et perf le PATCH, une rupture (!) le MAJOR. docs ou refactor ne changent pas la version publiée.",
    },
    {
      id: "git-mastery-workflows-fill-1",
      type: "fill",
      prompt: "Complétez les messages pour qu'ils respectent Conventional Commits.",
      code: "{{1}}(auth): add Google OAuth provider\n{{2}}(api): resolve race condition in checkout\n{{3}}: update README with deployment instructions\nfeat{{4}}: drop support for Node 16",
      blanks: [
        { options: ["fix", "docs", "feat"], answer: 2 },
        { options: ["feat", "fix", "style"], answer: 1 },
        { options: ["chore", "docs", "ci"], answer: 1 },
        { options: ["?", "!", "*"], answer: 1 },
      ],
      explanation:
        "Le format est type(scope): description. Le ! après le type signale un changement non rétrocompatible.",
    },
    {
      id: "git-mastery-workflows-order-1",
      type: "order",
      prompt: "Faites évoluer la version 1.4.2 : remettez ces publications dans l'ordre de leurs numéros.",
      steps: [
        "fix: corriger un bug, version 1.4.3",
        "feat: ajouter une option, version 1.5.0",
        "fix: corriger un bug, version 1.5.1",
        "feat!: supprimer une API, version 2.0.0",
      ],
      explanation:
        "Un fix incrémente le PATCH, un feat le MINOR en remettant le PATCH à 0, une rupture le MAJOR en remettant les deux autres à 0.",
    },
  ],
  "/tech-mastry/git-mastery/conflict-resolution": [
    {
      id: "git-mastery-conflict-resolution-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la résolution d'un conflit lors d'un git merge main.",
      steps: [
        "Lancer git merge main et constater le conflit",
        "Ouvrir les fichiers et comprendre l'intention des deux versions",
        "Éditer le fichier et supprimer les marqueurs de conflit",
        "Lancer les tests",
        "git add des fichiers résolus",
        "git commit pour finaliser le merge",
      ],
      explanation:
        "On résout d'abord, on vérifie, puis on indexe et on committe. Marquer comme résolu avant de tester risque de valider du code cassé.",
    },
    {
      id: "git-mastery-conflict-resolution-classify-1",
      type: "classify",
      prompt: "Classez ces pratiques selon qu'elles préviennent les conflits ou aident à les résoudre.",
      categories: ["Prévenir", "Résoudre"],
      items: [
        { text: "Garder des branches courtes", category: 0 },
        { text: "Rebaser régulièrement sur main", category: 0 },
        { text: "Activer rerere.enabled", category: 1 },
        { text: "Utiliser git mergetool", category: 1 },
        { text: "Coordonner les modifications des fichiers partagés", category: 0 },
        { text: "Lire les versions des deux côtés avant de combiner", category: 1 },
      ],
      explanation:
        "Des intégrations fréquentes réduisent les divergences. rerere et les outils de merge n'évitent pas le conflit, ils facilitent sa résolution.",
    },
    {
      id: "git-mastery-conflict-resolution-fill-1",
      type: "fill",
      prompt: "Terminez un rebase interrompu par un conflit.",
      code: "git {{1}} main\n# conflit dans src/app.ts : on édite le fichier\ngit {{2}} src/app.ts\ngit rebase {{3}}",
      blanks: [
        { options: ["merge", "rebase", "cherry-pick"], answer: 1 },
        { options: ["commit", "add", "stash"], answer: 1 },
        { options: ["--abort", "--skip", "--continue"], answer: 2 },
      ],
      explanation:
        "Dans un rebase, on indexe le fichier résolu puis on reprend avec --continue. --abort annule tout et --skip abandonne le commit en cours.",
    },
  ],
  "/tech-mastry/git-mastery/git-hooks": [
    {
      id: "git-mastery-git-hooks-match-1",
      type: "match",
      prompt: "Associez chaque hook à son usage typique.",
      pairs: [
        { term: "pre-commit", definition: "Lint et formatage des fichiers indexés" },
        { term: "commit-msg", definition: "Validation du format du message" },
        { term: "pre-push", definition: "Tests et build avant l'envoi au remote" },
        { term: "post-merge", definition: "Réinstallation des dépendances après un merge" },
        { term: "pre-receive", definition: "Refus de pushes côté serveur" },
      ],
      explanation:
        "Les quatre premiers sont des hooks clients, contournables avec --no-verify. pre-receive tourne sur le serveur et s'impose à tous.",
    },
    {
      id: "git-mastery-git-hooks-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre ce qui se passe quand vous committez puis poussez avec Husky.",
      steps: [
        "git commit déclenche le hook pre-commit (lint-staged)",
        "Le message est saisi",
        "Le hook commit-msg lance commitlint",
        "Le commit est créé",
        "git push déclenche le hook pre-push",
        "Le serveur reçoit les commits",
      ],
      explanation:
        "pre-commit s'exécute avant la création du commit, commit-msg après la saisie du message, pre-push juste avant l'envoi au remote.",
    },
    {
      id: "git-mastery-git-hooks-fill-1",
      type: "fill",
      prompt: "Complétez la configuration Husky.",
      code: "pnpm add -D {{1}} lint-staged @commitlint/cli\nnpx husky init\necho \"npx {{2}}\" > .husky/pre-commit\necho 'npx --no -- commitlint --edit \"$1\"' > .husky/{{3}}",
      blanks: [
        { options: ["prettier", "husky", "eslint"], answer: 1 },
        { options: ["lint-staged", "commitlint", "husky"], answer: 0 },
        { options: ["pre-push", "pre-commit", "commit-msg"], answer: 2 },
      ],
      explanation:
        "lint-staged va dans pre-commit pour travailler sur les fichiers indexés, commitlint dans commit-msg car il lit le fichier du message.",
    },
  ],
};
