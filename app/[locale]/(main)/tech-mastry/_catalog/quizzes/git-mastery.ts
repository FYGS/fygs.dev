import type { AreaQuizzes } from "./types";

export const gitMasteryQuizzes: AreaQuizzes = {
  "/tech-mastry/git-mastery/branching-strategies": [
    {
      id: "git-mastery-branching-strategies-1",
      question: "Dans GitHub Flow, quelle branche doit rester en permanence déployable ?",
      options: [
        "main, où l'on fusionne les feature branches par pull request",
        "develop, qui sert de zone d'intégration partagée avant chaque passage en production",
        "release, créée à chaque version planifiée de l'application",
        "staging, qui reflète l'environnement de recette de l'équipe",
      ],
      correctIndex: 0,
      explanation:
        "GitHub Flow n'a qu'une branche durable : main, toujours déployable. Il n'y a ni develop ni release, ce qui le distingue de Git Flow.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-branching-strategies-2",
      question: "Dans Git Flow, d'où part une branche hotfix pour corriger un bug urgent en production ?",
      options: [
        "De develop, puis elle est fusionnée uniquement dans develop",
        "De la dernière feature branch fusionnée dans develop",
        "De main, puis elle est fusionnée dans main et dans develop",
        "De la branche release ouverte, qu'elle remplace ensuite",
      ],
      correctIndex: 2,
      explanation:
        "Le hotfix part de main, car c'est le code en production. Il est ensuite fusionné dans main et dans develop pour que la correction ne soit pas perdue à la prochaine release.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-branching-strategies-3",
      question:
        "Une équipe de 4 développeurs maintient un SaaS déployé plusieurs fois par jour, avec une bonne CI. Quelle stratégie est la mieux adaptée ?",
      options: [
        "Git Flow, avec une branche release pour chaque déploiement",
        "GitHub Flow, avec main toujours déployable et des PR courtes",
        "Une branche longue par environnement, fusionnée chaque semaine",
        "Aucune branche : chacun travaille en local jusqu'à la livraison",
      ],
      correctIndex: 1,
      explanation:
        "Une petite équipe en déploiement continu profite de la simplicité de GitHub Flow. Git Flow ajoute des branches de release qui ralentissent un rythme de déploiement quotidien.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-branching-strategies-4",
      question:
        "En trunk-based development, comment intégrer chaque jour dans main une fonctionnalité qui prendra deux semaines sans l'exposer aux utilisateurs ?",
      options: [
        "En la gardant sur une branche de deux semaines, rebasée chaque jour sur main",
        "En la développant sur develop puis en fusionnant à la fin",
        "En ne committant qu'une fois la fonctionnalité entièrement terminée",
        "En l'intégrant par petits commits derrière un feature flag désactivé",
      ],
      correctIndex: 3,
      explanation:
        "Le trunk-based repose sur de petites intégrations quotidiennes et sur des feature flags qui masquent le code inachevé. Une branche de deux semaines reproduit le problème d'intégration tardive que cette stratégie veut éviter.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-branching-strategies-5",
      question: "Pourquoi les branches qui vivent longtemps sont-elles un problème d'après le comparatif de la page ?",
      options: [
        "Git ralentit proportionnellement au nombre de commits d'une branche",
        "Les branches longues ne peuvent plus être supprimées proprement une fois fusionnées",
        "Elles divergent de main : conflits plus gros et problèmes découverts tard",
        "Les pull requests sont refusées automatiquement au-delà d'une semaine",
      ],
      correctIndex: 2,
      explanation:
        "Plus une branche s'éloigne de la base partagée, plus il y a de lignes modifiées des deux côtés, donc de conflits, et plus tard on découvre les incompatibilités. Git lui-même n'a pas de limite de durée sur les branches.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-branching-strategies-6",
      question:
        "Une équipe en Git Flow subit des merges douloureux : des features de 3 semaines sur develop et une release par mois. Quelle amélioration traite la cause racine ?",
      options: [
        "Des branches courtes intégrées souvent, avec des feature flags pour le code inachevé",
        "Ajouter une branche d'intégration intermédiaire entre develop et les features, validée chaque semaine",
        "Imposer un squash systématique pour éviter les conflits au merge",
        "Interdire les merges et ne transmettre le travail que par cherry-pick",
      ],
      correctIndex: 0,
      explanation:
        "La douleur vient de la durée de vie des branches, donc de la divergence. Une couche de branches de plus ou un squash ne réduisent pas les lignes modifiées des deux côtés, et le cherry-pick multiplie les commits dupliqués.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/git-mastery/advanced-commands": [
    {
      id: "git-mastery-advanced-commands-1",
      question: "Que fait git rebase -i HEAD~3 ?",
      options: [
        "Il annule les 3 derniers commits et supprime leurs modifications du répertoire de travail",
        "Il ouvre un éditeur pour réordonner, fusionner, reformuler ou supprimer ces commits",
        "Il fusionne automatiquement les 3 derniers commits en un seul",
        "Il copie les 3 derniers commits sur une nouvelle branche",
      ],
      correctIndex: 1,
      explanation:
        "Le rebase interactif présente une liste de commits (pick, reword, squash, fixup, drop...) que vous éditez. Rien n'est supprimé ou fusionné sans que vous l'indiquiez dans cette liste.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-advanced-commands-2",
      question: "À quoi sert git reflog ?",
      options: [
        "À lister l'historique partagé des commits déjà poussés sur le remote",
        "À afficher les fichiers modifiés mais pas encore commités",
        "À garder la trace des conflits déjà résolus pour les rejouer",
        "À retrouver les anciennes positions de HEAD en local, même après un reset --hard",
      ],
      correctIndex: 3,
      explanation:
        "Le reflog est un journal local des déplacements de HEAD et des branches, conservé environ 90 jours par défaut. Il ne se partage pas et n'a rien à voir avec rerere, qui mémorise les résolutions de conflits.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-advanced-commands-3",
      question:
        "Vous venez d'exécuter git reset --hard HEAD~2 par erreur ; ces commits n'avaient jamais été poussés. Que faire ?",
      options: [
        "git reflog pour repérer l'état d'avant, puis git reset --hard HEAD@{1}",
        "git revert HEAD~2, qui recrée les deux commits supprimés par le reset",
        "Rien : des commits non poussés sont perdus définitivement après un reset --hard",
        "git stash pop, qui restaure les commits supprimés par le reset",
      ],
      correctIndex: 0,
      explanation:
        "Le reflog conserve l'ancien HEAD : HEAD@{1} désigne la position avant le reset. Les commits ne sont pas effacés immédiatement, ils ne sont plus qu'inaccessibles depuis une branche ; stash et revert ne les restaurent pas.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-advanced-commands-4",
      question: "Vous exécutez git cherry-pick a1b2c3d sur main. Quel est le résultat ?",
      options: [
        "Le commit est déplacé de sa branche d'origine vers main, qu'il quitte définitivement",
        "Un merge commit à deux parents est créé sur main",
        "Un nouveau commit au contenu équivalent, mais avec un hash différent",
        "Le même commit est ajouté, avec le même hash que l'original",
      ],
      correctIndex: 2,
      explanation:
        "Le cherry-pick rejoue le changement sur un autre parent : c'est un nouveau commit, donc un nouveau hash. L'original reste intact sur sa branche, et l'option -x permet d'y faire référence dans le message.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-advanced-commands-5",
      question:
        "Un bug est apparu quelque part entre v2.0 (saine) et HEAD, soit environ 1000 commits. Quelle approche est la plus efficace ?",
      options: [
        "git bisect : environ 500 tests, puisqu'il faut vérifier la moitié des commits environ",
        "git blame sur chaque fichier, en testant tous les commits un par un",
        "git bisect : environ 100 tests, de l'ordre de la racine carrée",
        "git bisect : environ 10 tests (log2 de 1000), automatisables avec git bisect run npm test",
      ],
      correctIndex: 3,
      explanation:
        "La recherche dichotomique divise l'intervalle par deux à chaque étape : environ 10 tests pour 1000 commits. Avec git bisect run et un script qui retourne 0 (sain) ou non nul (bugué), tout se fait sans intervention.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-advanced-commands-6",
      question:
        "Un collègue a déjà récupéré votre branche feature. Vous faites git commit --amend sur le dernier commit poussé, puis git push. Que se passe-t-il ?",
      options: [
        "Le push réussit : Git fusionne automatiquement les deux versions du commit",
        "Le push est rejeté (non fast-forward) ; le forcer écraserait l'historique distant",
        "Le push réussit, car amend conserve le hash du commit d'origine",
        "Le push est rejeté, mais un git pull --rebase règle le problème sans aucun risque pour le collègue",
      ],
      correctIndex: 1,
      explanation:
        "Amend crée un nouveau commit au hash différent : l'historique local diverge du remote et le push classique est refusé. Forcer le push réécrit une branche partagée, et un pull --rebase dupliquerait les commits chez ceux qui ont l'ancienne version.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/git-mastery/git-internals": [
    {
      id: "git-mastery-git-internals-1",
      question: "Que contient exactement un objet blob ?",
      options: [
        "Le nom du fichier, ses permissions et son contenu au moment du commit",
        "Le diff entre la version courante et la version précédente",
        "Le contenu brut d'un fichier, sans son nom ni ses permissions",
        "Un instantané d'un répertoire avec ses sous-dossiers",
      ],
      correctIndex: 2,
      explanation:
        "Un blob ne stocke que les octets du fichier. Le nom et le mode sont portés par le tree, et Git stocke des instantanés complets plutôt que des diffs.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-git-internals-2",
      question: "Dans quel objet Git trouve-t-on le nom d'un fichier ?",
      options: [
        "Dans le tree qui référence le blob",
        "Dans le blob, en en-tête du contenu",
        "Dans le commit, avec la liste des fichiers modifiés",
        "Dans la référence de la branche (refs/heads)",
      ],
      correctIndex: 0,
      explanation:
        "Un tree associe un nom, un mode (100644, 040000...) et le hash d'un blob ou d'un sous-tree. Renommer un fichier sans changer son contenu ne crée donc pas de nouveau blob.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-git-internals-3",
      question:
        "Deux fichiers a.txt et b.txt ont un contenu strictement identique. Combien de blobs Git stocke-t-il pour eux ?",
      options: [
        "Deux, un par nom de fichier, puisque les noms sont différents",
        "Deux, car leurs dates de modification diffèrent",
        "Un seul, mais seulement s'ils sont dans le même dossier",
        "Un seul : même contenu, même hash, et deux entrées du tree le référencent",
      ],
      correctIndex: 3,
      explanation:
        "Le hash du blob ne dépend que du contenu, pas du nom, de l'emplacement ni de la date. Les deux entrées du tree pointent donc vers le même objet : c'est la déduplication native de Git.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-internals-4",
      question: "Que référence un objet commit ?",
      options: [
        "Une liste de diffs par fichier et le hash du dernier blob modifié",
        "Un tree racine, ses commits parents, l'auteur, le committer et le message",
        "Une copie de chaque blob modifié, sans notion de tree",
        "Le nom de la branche et la liste des fichiers du projet",
      ],
      correctIndex: 1,
      explanation:
        "Un commit pointe vers le tree racine du projet (l'instantané) et vers zéro, un ou plusieurs parents. C'est ce chaînage par parents qui forme le DAG ; le nom de branche n'est pas dans le commit.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-internals-5",
      question:
        "Vous reformulez le message d'un ancien commit avec git rebase -i. Pourquoi tous les commits suivants changent-ils aussi de hash ?",
      options: [
        "Chaque commit inclut le hash de son parent : changer un ancêtre change ses descendants",
        "Git renumérote tous les commits de la branche après une réécriture de l'historique",
        "Le hash dépend de la date du dernier push, qui change",
        "Seuls les trees sont recalculés, les commits gardent leur hash",
      ],
      correctIndex: 0,
      explanation:
        "Le hash d'un commit est calculé à partir de son contenu, y compris la ligne parent. Si le parent change, l'enfant change, et ainsi de suite : c'est pourquoi réécrire une branche déjà publiée pose problème.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-internals-6",
      question:
        "Dans un projet de 1000 fichiers, vous modifiez un seul fichier situé dans src/lib/. Quels nouveaux objets le commit crée-t-il ?",
      options: [
        "1000 blobs, car chaque commit est un instantané complet",
        "Un blob et un commit, sans nouveau tree puisque la structure ne change pas",
        "Un blob, un tree par dossier du chemin (lib, src, racine) et un commit",
        "Un blob et un commit, avec seulement le tree racine mis à jour",
      ],
      correctIndex: 2,
      explanation:
        "Le contenu change, donc nouveau blob, donc nouveau hash dans le tree lib, qui change à son tour, et ainsi de suite jusqu'à la racine. Les autres blobs et trees sont réutilisés tels quels, ce qui rend les instantanés peu coûteux.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/git-mastery/workflows": [
    {
      id: "git-mastery-workflows-1",
      question: "Lequel de ces messages respecte la convention Conventional Commits ?",
      options: [
        "login page fixed",
        "Updated a few things in the API layer",
        "WIP, ne pas relire",
        "fix(api): resolve race condition in checkout",
      ],
      correctIndex: 3,
      explanation:
        "Le format attendu est type(scope optionnel): description. Les autres messages n'ont ni type ni structure exploitable, et ne permettent pas de générer un changelog ou de déduire la version.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-workflows-2",
      question: "La version actuelle est 1.4.2 et vous publiez uniquement une correction de bug rétrocompatible. Quelle est la nouvelle version ?",
      options: ["1.5.0", "1.4.3", "2.0.0", "1.4.2-fix"],
      correctIndex: 1,
      explanation:
        "Une correction rétrocompatible incrémente le PATCH : 1.4.3. MINOR est réservé aux nouvelles fonctionnalités et MAJOR aux ruptures de compatibilité.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-workflows-3",
      question: "La version est 1.4.2 et vous ajoutez une nouvelle fonctionnalité rétrocompatible. Quelle version publier ?",
      options: ["1.5.2", "1.4.3", "1.5.0", "2.0.0"],
      correctIndex: 2,
      explanation:
        "Une nouvelle fonctionnalité incrémente le MINOR, et le PATCH repasse à 0 : 1.5.0. Garder le 2 de la version précédente (1.5.2) est une erreur courante.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-workflows-4",
      question: "Quel effet SemVer a un commit « feat!: drop support for Node 16 » ?",
      options: [
        "Une montée MAJOR : le ! signale une rupture de compatibilité",
        "Une montée MINOR, car le type du commit est feat et qu'il ajoute du code",
        "Une montée PATCH, car aucune nouvelle API n'est ajoutée",
        "Aucun effet : seuls les footers sont pris en compte",
      ],
      correctIndex: 0,
      explanation:
        "Le ! après le type (ou un footer BREAKING CHANGE) marque une rupture de compatibilité, qui prime sur le type feat et impose une version MAJOR.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-workflows-5",
      question:
        "Vous réorganisez un module en extrayant des fonctions, sans changer son comportement. Quel type de commit choisir ?",
      options: [
        "style, car le code est simplement réorganisé et mis en forme autrement",
        "refactor, car la structure change mais pas le comportement",
        "feat, car le code est désormais mieux organisé",
        "chore, car aucune fonctionnalité n'est touchée",
      ],
      correctIndex: 1,
      explanation:
        "refactor désigne une restructuration sans changement de comportement. style est limité au formatage (espaces, points-virgules) et chore aux tâches de build, CI ou dépendances.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-workflows-6",
      question:
        "Un commit corrige un bug mais change aussi, de façon incompatible, la signature d'une API publique. Quel message et quel effet SemVer ?",
      options: [
        "fix(api): ... car c'est une correction de bug, et seul le PATCH monte à la livraison",
        "feat(api): ... car la signature change, et le MINOR monte",
        "chore(api): ... car le changement est interne, sans release",
        "fix(api)!: ... avec un footer BREAKING CHANGE, ce qui impose une version MAJOR",
      ],
      correctIndex: 3,
      explanation:
        "La rupture de compatibilité prime sur le type : peu importe que le commit soit un fix, les consommateurs de l'API doivent être prévenus par une version MAJOR. Cacher la rupture dans un simple fix casserait leurs builds sans avertissement.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/git-mastery/conflict-resolution": [
    {
      id: "git-mastery-conflict-resolution-1",
      question: "Dans quel cas Git signale-t-il un conflit lors d'un merge ?",
      options: [
        "Quand les deux branches modifient les mêmes lignes d'un fichier de façons différentes",
        "Dès que deux branches modifient le même fichier, même à des endroits distincts et sans lien entre eux",
        "Quand deux développeurs ont travaillé le même jour sur le projet",
        "Quand la branche à fusionner contient plus de commits que la courante",
      ],
      correctIndex: 0,
      explanation:
        "Git fusionne automatiquement des modifications situées dans des zones différentes d'un même fichier. Le conflit apparaît seulement quand il ne peut pas décider entre deux changements concurrents sur les mêmes lignes.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-conflict-resolution-2",
      question: "Dans un fichier en conflit, que représentent les blocs délimités par <<<<<<<, ======= et >>>>>>> ?",
      options: [
        "Avant =======, l'ancienne version ; après, la nouvelle version du fichier",
        "Avant =======, l'autre branche ; après, la branche courante",
        "Avant =======, la branche courante (HEAD) ; après, l'autre. Les marqueurs sont à retirer",
        "Des annotations que le compilateur ignore, qu'on peut donc laisser",
      ],
      correctIndex: 2,
      explanation:
        "Pour un merge, la première partie est la branche courante et la seconde celle qu'on fusionne. Les marqueurs doivent être retirés à la main (ou via un outil), sinon ils finissent dans le code.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-conflict-resolution-3",
      question:
        "Votre branche passe à import { useState, useEffect } et l'autre à import { useState, useCallback }. Quelle est la bonne résolution ?",
      options: [
        "Garder votre ligne, puisque c'est votre travail",
        "Garder leur ligne, puisqu'elle est déjà arrivée en premier sur la branche main",
        "Prendre la version de l'autre branche avec git checkout --theirs",
        "Combiner : import { useState, useEffect, useCallback } from \"react\"",
      ],
      correctIndex: 3,
      explanation:
        "Les deux changements sont légitimes et indépendants : les imports se cumulent. Choisir un seul camp supprimerait un hook utilisé ailleurs dans le code et casserait la compilation.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-conflict-resolution-4",
      question:
        "Vous avez migré getUser vers Prisma ; l'autre branche a ajouté AND active = 1 à l'ancienne requête SQL. Que produire ?",
      options: [
        "Garder uniquement votre version Prisma, plus moderne",
        "La version Prisma qui intègre le filtre active: true",
        "Garder uniquement l'ancienne requête SQL avec son filtre sur active",
        "Conserver les deux fonctions sous deux noms différents",
      ],
      correctIndex: 1,
      explanation:
        "Résoudre un conflit consiste à préserver l'intention des deux côtés : votre refactoring et la règle métier du filtre. Garder une seule version fait perdre soit la migration, soit une règle importante, souvent sans que les tests le détectent.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-conflict-resolution-5",
      question: "Que fait git config rerere.enabled true ?",
      options: [
        "Il résout automatiquement tous les conflits en gardant votre version",
        "Il empêche Git de signaler les conflits dans les fichiers de configuration du dépôt",
        "Il mémorise vos résolutions et les rejoue si le conflit se représente",
        "Il force un rebase avant chaque merge pour éviter les conflits",
      ],
      correctIndex: 2,
      explanation:
        "rerere (reuse recorded resolution) enregistre la résolution d'un conflit et la réapplique quand le même conflit réapparaît, par exemple lors de rebases répétés. Il ne choisit jamais un camp à votre place.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-conflict-resolution-6",
      question:
        "Pendant git rebase main, des conflits surviennent et vous les corrigez dans vos fichiers. Quelle est la suite correcte ?",
      options: [
        "git add des fichiers résolus, puis git rebase --continue",
        "git commit puis git push --force pour publier la résolution",
        "git merge --continue pour terminer le rebase",
        "git rebase --abort, qui valide la résolution et termine l'opération",
      ],
      correctIndex: 0,
      explanation:
        "Dans un rebase, on indexe les fichiers résolus puis on reprend avec --continue ; Git recrée alors le commit rejoué. --abort annule tout le rebase et revient à l'état initial, il ne valide rien.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/git-mastery/git-hooks": [
    {
      id: "git-mastery-git-hooks-1",
      question: "Quel hook côté client sert à valider le format du message de commit ?",
      options: ["pre-commit", "pre-push", "prepare-commit-msg", "commit-msg"],
      correctIndex: 3,
      explanation:
        "commit-msg reçoit le fichier du message saisi et peut refuser le commit (commitlint s'y branche). pre-commit s'exécute avant et ne voit pas le message, et prepare-commit-msg sert à préremplir le message.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-git-hooks-2",
      question: "Quel est le rôle de lint-staged ?",
      options: [
        "Lancer tous les tests du projet, sur tous les fichiers, avant chaque commit",
        "Exécuter linters et formateurs uniquement sur les fichiers indexés",
        "Remplacer Husky pour installer les hooks dans .git/hooks",
        "Vérifier que le message de commit respecte la convention",
      ],
      correctIndex: 1,
      explanation:
        "lint-staged applique eslint, prettier, etc. seulement aux fichiers dans l'index, ce qui garde le pre-commit rapide. La validation du message relève de commitlint et l'installation des hooks de Husky.",
      difficulty: "easy",
    },
    {
      id: "git-mastery-git-hooks-3",
      question:
        "Pourquoi placer la suite de tests complète et le build dans pre-push plutôt que dans pre-commit ?",
      options: [
        "Parce que pre-commit ne peut pas exécuter de commandes npm",
        "Parce que pre-push s'exécute côté serveur, donc avec plus de ressources",
        "Parce que pre-commit tourne à chaque commit et doit rester rapide, le push étant plus rare",
        "Parce que les tests ne peuvent pas s'exécuter avant la création du commit",
      ],
      correctIndex: 2,
      explanation:
        "Un hook lent à chaque commit pousse les développeurs à le contourner. pre-push est un hook client déclenché moins souvent, adapté aux vérifications plus longues, mais ce n'est pas un hook serveur.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-hooks-4",
      question: "Un développeur exécute git commit --no-verify. Que se passe-t-il et que doit en déduire l'équipe ?",
      options: [
        "Les hooks pre-commit et commit-msg sont ignorés : la CI ou le serveur doit imposer les règles",
        "Le commit est refusé, car --no-verify exige des droits administrateur",
        "Seul le linting est ignoré, la validation du message reste active",
        "Les hooks s'exécutent quand même, mais leurs erreurs deviennent de simples avertissements non bloquants",
      ],
      correctIndex: 0,
      explanation:
        "--no-verify saute pre-commit et commit-msg. Les hooks client sont une aide au développeur, pas une garantie : seule la CI ou un hook serveur applique vraiment une règle à tout le monde.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-hooks-5",
      question: "Pourquoi utiliser Husky plutôt que d'écrire directement dans .git/hooks ?",
      options: [
        "Parce que Git n'exécute pas les scripts situés dans .git/hooks",
        "Parce que .git n'est pas versionné : Husky place les hooks dans le dépôt, pour l'équipe",
        "Parce que Husky remplace Git lui-même et rend l'exécution des hooks plus rapide",
        "Parce que .git/hooks n'accepte que des scripts écrits en Bash",
      ],
      correctIndex: 1,
      explanation:
        "Le contenu de .git ne se clone ni ne se pousse, donc chaque développeur devrait recréer ses hooks. Husky stocke les scripts dans .husky/ (versionné) et configure Git pour les utiliser.",
      difficulty: "medium",
    },
    {
      id: "git-mastery-git-hooks-6",
      question:
        "Vous voulez interdire les pushes directs sur main pour toute l'équipe, sans qu'un poste puisse le contourner. Que choisir ?",
      options: [
        "Un hook pre-push Husky qui refuse le push sur main",
        "Un hook pre-commit qui vérifie le nom de la branche courante",
        "Un hook post-merge qui annule automatiquement les commits poussés sur main",
        "Un hook pre-receive côté serveur (ou la protection de branche de la plateforme)",
      ],
      correctIndex: 3,
      explanation:
        "Seul un contrôle exécuté sur le serveur ne peut pas être désactivé par --no-verify ou en supprimant un hook local. pre-receive rejette le push entier si le script sort avec un code non nul.",
      difficulty: "hard",
    },
  ],
};
