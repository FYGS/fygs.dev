import type { AreaQuizzes } from "./types";

export const careerQuizzes: AreaQuizzes = {
  "/tech-mastry/preparation": [
    {
      id: "career-preparation-1",
      question:
        "Vous visez des entretiens dans 4 mois. Que faire dans le premier mois du plan ?",
      options: [
        "Réviser les fondamentaux, poser un planning et repérer vos points faibles",
        "Enchaîner des mock interviews complètes chaque jour dès la semaine 1",
        "Peaufiner le CV et envoyer les candidatures avant de réviser quoi que ce soit",
        "Attendre le dernier mois pour tout condenser avec une intensité maximale",
      ],
      correctIndex: 0,
      explanation:
        "Les 3-4 premiers mois servent à poser les bases et à diagnostiquer les lacunes, ce qui oriente le reste du plan. Les mock interviews intensives viennent plus tard, quand il y a de la matière à tester.",
      difficulty: "easy",
    },
    {
      id: "career-preparation-2",
      question:
        "Face à un énoncé d'algorithme, vous avez l'idée générale et êtes tenté de coder immédiatement. Quelle est la meilleure décision ?",
      options: [
        "Coder tout de suite pour montrer votre rapidité et corriger les erreurs au fil de l'eau",
        "Comprendre le problème, poser des questions et planifier l'approche d'abord",
        "Rester silencieux pour ne pas dire de bêtises avant d'avoir la solution",
        "Écrire la version la plus optimisée possible dès la première ligne",
      ],
      correctIndex: 1,
      explanation:
        "Se précipiter sur le code est une erreur classique : on résout le mauvais problème ou on oublie des cas limites. Prendre le temps de clarifier et planifier est évalué positivement.",
      difficulty: "easy",
    },
    {
      id: "career-preparation-3",
      question:
        "À une semaine de l'entretien, vous réalisez que la programmation dynamique reste fragile. Quelle est la meilleure stratégie ?",
      options: [
        "Résoudre dix problèmes Hard par jour, en doublant le chrono, jusqu'à la veille de l'entretien",
        "Reporter l'entretien en inventant une excuse pour gagner un mois",
        "Révision légère et ciblée, repos mental et logistique prête, sans viser la perfection",
        "Abandonner les révisions techniques et ne travailler que le behavioral",
      ],
      correctIndex: 2,
      explanation:
        "La dernière semaine est consacrée à une révision légère, au repos et à la logistique. Un bachotage intensif épuise et dégrade la performance le jour J, sans combler une vraie lacune.",
      difficulty: "medium",
    },
    {
      id: "career-preparation-4",
      question:
        "Pendant un exercice, votre première solution fonctionne mais est en O(n²) et vous ne voyez pas mieux. Que faites-vous ?",
      options: [
        "Vous cherchez en silence la solution optimale sans rien montrer jusqu'à la fin du temps imparti",
        "Vous déclarez le problème impossible et demandez à passer à la suite",
        "Vous codez sans commenter pour économiser les minutes restantes",
        "Vous présentez la solution correcte, annoncez sa complexité et proposez des optimisations",
      ],
      correctIndex: 3,
      explanation:
        "Une solution correcte, analysée et accompagnée de pistes d'amélioration montre la démarche que l'on recherche. Le silence ou l'abandon ne laissent rien à évaluer.",
      difficulty: "medium",
    },
    {
      id: "career-preparation-5",
      question:
        "Un candidat ne résout que des problèmes Easy seul, sans chrono ni mock interview, pendant trois mois. Quel est le principal risque ?",
      options: [
        "Les problèmes Easy ne servent à rien pour construire les bases",
        "Il sera trop reposé et manquera de stress le jour de l'entretien",
        "Il ne s'entraîne ni au temps limité ni à la communication, ni ne reçoit de retours",
        "Il connaîtra trop de patterns et risquera de les confondre entre eux lors de l'entretien final",
      ],
      correctIndex: 2,
      explanation:
        "Résoudre seul ne prépare ni à expliquer son raisonnement ni à gérer le temps ; les mock interviews et les sessions chronométrées comblent ce manque. Les Easy restent utiles pour les bases, ce n'est pas là le problème.",
      difficulty: "medium",
    },
    {
      id: "career-preparation-6",
      question:
        "Il vous reste 8 semaines et vous êtes faible en system design, correct en algorithmes, moyen en behavioral. Quel plan est le plus défendable ?",
      options: [
        "Consacrer tout le temps aux algorithmes, car ils sont plus faciles à mesurer et à chronométrer seul",
        "Répartir le temps à parts égales sans tenir compte du diagnostic initial",
        "Ne travailler que le system design et ignorer les deux autres épreuves",
        "Cibler le system design, entretenir les autres épreuves et multiplier les mock à l'approche",
      ],
      correctIndex: 3,
      explanation:
        "Le plan efficace s'appuie sur le diagnostic des points faibles tout en couvrant les trois épreuves et en augmentant la fréquence des mock interviews vers la fin. Ignorer une épreuve crée un point d'échec unique.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/preparation/mock-interviews": [
    {
      id: "career-mock-interviews-1",
      question:
        "Dans un entretien algorithme de 45 minutes, quel enchaînement d'étapes est recommandé ?",
      options: [
        "Implémentation, puis clarification du problème, puis approche, puis tests",
        "Tests, puis implémentation, puis approche, puis questions de clarification",
        "Approche, puis implémentation, puis clarification des cas limites en dernier",
        "Clarification, approche et pseudocode, implémentation, tests et optimisation",
      ],
      correctIndex: 3,
      explanation:
        "On clarifie d'abord pour ne pas résoudre le mauvais problème, on planifie, puis on code et on teste. Inverser l'ordre fait perdre du temps sur de mauvaises hypothèses.",
      difficulty: "easy",
    },
    {
      id: "career-mock-interviews-2",
      question:
        "Pourquoi préparer 5 histoires STAR alors qu'un entretien behavioral de 30 minutes n'en utilise que 3 ?",
      options: [
        "Pour pouvoir choisir pour chaque question l'histoire la plus pertinente",
        "Pour réciter toutes les histoires dans l'ordre même hors sujet",
        "Pour remplir le temps si l'intervieweur ne pose aucune question",
        "Pour disposer d'exemples fictifs adaptables à n'importe quelle question",
      ],
      correctIndex: 0,
      explanation:
        "Avoir un petit stock d'histoires réelles permet de choisir celle qui répond le mieux (conflit, échec, leadership...). Les inventer ou les réciter sans lien avec la question affaiblit la crédibilité.",
      difficulty: "easy",
    },
    {
      id: "career-mock-interviews-3",
      question:
        "En mock system design, on vous demande de concevoir un raccourcisseur d'URL. Quelle est la meilleure première étape ?",
      options: [
        "Dessiner tout de suite le schéma de base de données et les index",
        "Choisir la technologie de stockage la plus populaire du moment",
        "Clarifier les requirements et les NFRs, puis estimer la charge attendue",
        "Détailler en profondeur le composant que vous maîtrisez le mieux",
      ],
      correctIndex: 2,
      explanation:
        "Les requirements et les contraintes (trafic, latence, disponibilité) guident toutes les décisions suivantes. Plonger dans un composant avant de les connaître expose à concevoir hors sujet.",
      difficulty: "medium",
    },
    {
      id: "career-mock-interviews-4",
      question:
        "Vous trouvez rapidement une solution brute force à un problème. Que faire en entretien algorithmique ?",
      options: [
        "La garder secrète et attendre de trouver la solution optimale",
        "L'énoncer comme base, analyser sa complexité, puis chercher à l'améliorer",
        "La coder immédiatement sans en parler et passer aux tests",
        "La rejeter parce qu'elle ne sera pas assez impressionnante",
      ],
      correctIndex: 1,
      explanation:
        "Commencer par la force brute donne une base correcte et un point de comparaison pour l'optimisation. Garder le silence prive l'intervieweur de votre raisonnement.",
      difficulty: "medium",
    },
    {
      id: "career-mock-interviews-5",
      question:
        "Après un mock, votre partenaire dit : 'Ton code marchait, mais je n'ai pas compris ta démarche.' Que travailler au prochain essai ?",
      options: [
        "Penser à voix haute et structurer : clarifier, annoncer l'approche, puis coder",
        "Coder plus vite pour dégager du temps de réflexion à la fin de la session chronométrée",
        "Écrire moins de tests pour que le code paraisse plus lisible",
        "Mémoriser davantage de solutions toutes faites pour gagner en confiance",
      ],
      correctIndex: 0,
      explanation:
        "Le feedback pointe un défaut de communication, pas de correction : l'évaluation porte sur la façon de penser. Coder plus vite ou apprendre par cœur n'y répond pas.",
      difficulty: "medium",
    },
    {
      id: "career-mock-interviews-6",
      question:
        "En mock chronométré, vous avez consommé 20 minutes sur l'approche (budget : 10) et rien n'est encore codé. Quel est le meilleur réflexe ?",
      options: [
        "Continuer à chercher l'approche idéale quel que soit le temps restant dans la session",
        "Demander à recommencer l'exercice depuis zéro avec un nouveau chrono",
        "Sauter l'implémentation et décrire seulement la solution à l'oral",
        "Annoncer le compromis, retenir l'approche correcte la plus simple et l'implémenter",
      ],
      correctIndex: 3,
      explanation:
        "Gérer le temps fait partie de l'évaluation : une solution simple, correcte et testée vaut mieux qu'une idée optimale non implémentée. L'optimisation peut être discutée ensuite.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/preparation/stress-management": [
    {
      id: "career-stress-management-1",
      question: "Quelle est la séquence de la respiration 4-7-8 ?",
      options: [
        "Inspirer 8 s, retenir 7 s, puis expirer 4 s",
        "Inspirer 4 s, retenir 7 s, expirer 8 s",
        "Inspirer 4 s, retenir 4 s, expirer 4 s",
        "Inspirer 7 s, retenir 4 s, expirer 8 s",
      ],
      correctIndex: 1,
      explanation:
        "L'expiration longue (8 s) est ce qui favorise l'apaisement : inspirer 4 s, retenir 7 s, expirer 8 s, à répéter 3 ou 4 fois. Les autres séquences inversent les durées.",
      difficulty: "easy",
    },
    {
      id: "career-stress-management-2",
      question:
        "Vous pensez : 'Si je bloque, c'est fini.' Quel recadrage est le plus juste ?",
      options: [
        "Je ne dois jamais bloquer, donc je dois tout réviser une fois de plus",
        "Ils vont me piéger, donc je dois cacher mes hésitations",
        "Je dois être parfait pour que l'on me prenne au sérieux",
        "Bloquer et raisonner à voix haute est normal et attendu",
      ],
      correctIndex: 3,
      explanation:
        "Les intervieweurs observent comment vous raisonnez face à une difficulté, ce qui est justement leur but. Les autres formulations maintiennent la pression du perfectionnisme.",
      difficulty: "easy",
    },
    {
      id: "career-stress-management-3",
      question:
        "En visio, une montée d'angoisse intense survient en plein exercice. Quelle réaction est la plus adaptée ?",
      options: [
        "Un grounding 5-4-3-2-1 ou une respiration lente discrète, puis reprise orale",
        "Un power posing debout devant la caméra pendant deux minutes",
        "Une visualisation positive les yeux fermés pendant cinq minutes",
        "Parler plus vite pour finir l'exercice avant que l'angoisse ne s'installe vraiment",
      ],
      correctIndex: 0,
      explanation:
        "Grounding et respiration se font discrètement pendant l'entretien. Le power posing se pratique en privé avant, et la visualisation convient à la veille ou au matin, pas en pleine épreuve.",
      difficulty: "medium",
    },
    {
      id: "career-stress-management-4",
      question:
        "La veille d'un entretien important, vous songez à réviser jusqu'à 3 h du matin. Quel choix est le meilleur ?",
      options: [
        "Réviser toute la nuit et compenser avec plusieurs cafés le matin avant l'entretien",
        "Relire passivement vos notes au lit pour vous endormir plus tard",
        "Dormir 7-8 h après un exercice, un repas léger et une bonne hydratation",
        "Sauter le repas du soir pour garder l'esprit plus alerte",
      ],
      correctIndex: 2,
      explanation:
        "Sommeil, exercice, repas léger et hydratation préparent le corps, qui influence l'esprit. Une nuit courte dégrade la concentration bien plus qu'une heure de révision ne la compense.",
      difficulty: "medium",
    },
    {
      id: "career-stress-management-5",
      question:
        "Le matin de l'entretien, vous vous répétez 'Je vais échouer'. Quelle technique cible directement cette pensée ?",
      options: [
        "Vous forcez la pensée à disparaître en pensant très fort à autre chose",
        "Vous la niez en répétant 'tout ira bien' sans rien changer à votre état ni à votre préparation",
        "Vous attendez qu'elle passe sans rien faire, en évitant tout rituel",
        "Vous la recadrez en opportunité d'apprentissage et redirigez l'énergie du stress",
      ],
      correctIndex: 3,
      explanation:
        "Le recadrage cognitif remplace la pensée par une lecture plus utile et transforme le stress en énergie. Supprimer ou nier une pensée tend au contraire à la renforcer.",
      difficulty: "medium",
    },
    {
      id: "career-stress-management-6",
      question:
        "Pendant que vous codez, l'intervieweur reste silencieux et impassible. Quelle interprétation et quelle réaction sont les plus saines ?",
      options: [
        "Il observe ma démarche ; je continue à verbaliser et clarifie si besoin",
        "Il me juge mal ; je dois accélérer pour rattraper mon retard",
        "Il attend des excuses ; je m'arrête pour m'excuser de mon rythme et de mes hésitations",
        "Il cache la bonne réponse ; j'essaie de la deviner à son expression",
      ],
      correctIndex: 0,
      explanation:
        "Le silence est souvent une simple observation, et c'est une conversation entre professionnels, pas un piège. Verbaliser et clarifier maintient le dialogue ; s'affoler ou deviner dégrade la performance.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/career/salary-negotiation": [
    {
      id: "career-salary-negotiation-1",
      question:
        "Dès le premier appel, un recruteur vous demande votre salaire actuel. Quelle est la meilleure réponse ?",
      options: [
        "Donner le chiffre exact pour montrer votre transparence",
        "Annoncer un chiffre supérieur à la réalité pour vous positionner haut",
        "Rediriger poliment en demandant la fourchette prévue pour le poste",
        "Refuser de continuer le processus tant que le sujet n'est pas clos",
      ],
      correctIndex: 2,
      explanation:
        "Révéler votre salaire actuel en premier ancre l'offre sur votre passé plutôt que sur la valeur du poste. Mentir est risqué et un refus frontal ferme inutilement la porte.",
      difficulty: "easy",
    },
    {
      id: "career-salary-negotiation-2",
      question: "Pour comparer deux offres, que faut-il examiner ?",
      options: [
        "Le package total : salaire, bonus, equity et avantages",
        "Uniquement le salaire de base annuel affiché",
        "Uniquement la prime de bienvenue de la première année",
        "Le salaire d'un collègue que vous connaissez déjà dans l'entreprise",
      ],
      correctIndex: 0,
      explanation:
        "Bonus, equity, remote et avantages peuvent représenter une part importante de la valeur. Se limiter au salaire de base fausse la comparaison.",
      difficulty: "easy",
    },
    {
      id: "career-salary-negotiation-3",
      question:
        "L'employeur propose 55 k€ alors que votre cible réaliste est de 60 k€. Que faites-vous sur le moment ?",
      options: [
        "Accepter aussitôt pour montrer votre enthousiasme",
        "Remercier, rester posé puis demander 24 à 48 h pour réfléchir",
        "Refuser immédiatement en disant que l'offre est insultante",
        "Proposer sur-le-champ 56 k€ pour conclure vite",
      ],
      correctIndex: 1,
      explanation:
        "Laisser un silence puis demander du temps évite toute réaction impulsive et permet de préparer une contre-proposition argumentée. Accepter ou refuser à chaud ferme vos options.",
      difficulty: "medium",
    },
    {
      id: "career-salary-negotiation-4",
      question:
        "Votre cible réaliste est 60 k€ et vous devez annoncer le premier chiffre. À quoi ancrer votre demande ?",
      options: [
        "Exactement 60 k€, votre cible réaliste",
        "Environ 62 k€, juste au-dessus pour paraître raisonnable",
        "Environ 90 k€, sans justification pour tester l'employeur",
        "Environ 70 k€, soutenu par vos données de marché et vos réalisations",
      ],
      correctIndex: 3,
      explanation:
        "La première demande ancre la discussion : viser 10-20 % au-dessus de la cible laisse une marge de concession, à condition de rester justifiable. Demander exactement la cible ne laisse aucune marge et un chiffre irréaliste crédibilise mal.",
      difficulty: "medium",
    },
    {
      id: "career-salary-negotiation-5",
      question:
        "L'employeur ne peut pas dépasser 58 k€ (bande fixe) alors que vous visez 60 k€. Quelle issue est la plus solide ?",
      options: [
        "Accepter 58 k€ sans rien demander en échange pour éviter le conflit",
        "Menacer de partir chez un concurrent pour forcer l'exception",
        "Négocier bonus, equity, remote ou formation, avec une revue salariale à 6 mois écrite",
        "Refuser l'offre et critiquer la politique salariale auprès de l'équipe et des recruteurs",
      ],
      correctIndex: 2,
      explanation:
        "Quand la base est plafonnée, les autres composantes et une revue datée avec objectifs clairs compensent l'écart, à confirmer par écrit. Une menace ou une critique brûle les ponts dans un milieu où tout le monde se connaît.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/career/progression": [
    {
      id: "career-progression-1",
      question: "Quel est le scope typique d'un ingénieur Senior (L5-L6) ?",
      options: [
        "Des tâches individuelles guidées par un mentor",
        "Un système ou une équipe",
        "Plusieurs équipes ou l'organisation entière",
        "L'entreprise tout entière et son positionnement dans l'industrie",
      ],
      correctIndex: 1,
      explanation:
        "Le niveau Senior se caractérise par un scope système/équipe. Les tâches individuelles relèvent du Junior, le multi-équipes du Staff, l'entreprise du Principal.",
      difficulty: "easy",
    },
    {
      id: "career-progression-2",
      question:
        "Un mid-level veut passer Senior. Quelle attente distingue le plus ce niveau ?",
      options: [
        "Livrer encore plus de features seul, plus vite",
        "Maîtriser une technologie supplémentaire chaque trimestre",
        "Cumuler un an de plus d'ancienneté dans l'équipe actuelle",
        "Multiplier la productivité de l'équipe et diriger techniquement sans autorité formelle",
      ],
      correctIndex: 3,
      explanation:
        "Le Senior agit par effet de levier sur les autres (architecture, influence sur la roadmap technique), pas seulement par volume personnel. Plus de features seul reste un profil mid-level.",
      difficulty: "easy",
    },
    {
      id: "career-progression-3",
      question:
        "Senior depuis 3 ans, vous visez Staff. Quel dossier est le plus convaincant ?",
      options: [
        "Un problème ambigu transverse résolu entre équipes, aligné sur le business",
        "Un nombre record de tickets livrés dans votre équipe sur l'année",
        "Une expertise très pointue sur un seul composant que personne d'autre ne touche",
        "Un grand nombre de revues de code réalisées pour votre propre équipe",
      ],
      correctIndex: 0,
      explanation:
        "Le niveau Staff se juge sur l'impact multi-équipes, l'alignement technique/business et la résolution de problèmes ambigus. Le volume ou l'expertise isolée restent des preuves de niveau senior.",
      difficulty: "medium",
    },
    {
      id: "career-progression-4",
      question:
        "Vous estimez mériter une promotion. Quelle démarche est la plus efficace avec votre manager ?",
      options: [
        "Mettre en avant votre ancienneté, qui suffit dans la plupart des cas",
        "Évoquer une offre concurrente sans réelle intention de partir",
        "Rassembler des preuves d'impact au niveau visé et discuter des attentes du niveau",
        "Attendre en silence que votre travail soit remarqué par la direction lors des revues annuelles",
      ],
      correctIndex: 2,
      explanation:
        "Une promotion se justifie par un impact démontré et mesuré au niveau supérieur, discuté explicitement avec le manager. L'ancienneté seule ou une pression bluffée ne prouvent rien ; attendre passivement laisse la décision à d'autres.",
      difficulty: "medium",
    },
    {
      id: "career-progression-5",
      question:
        "Un collègue avec 10 ans d'expérience, toujours au scope équipe, demande le niveau Staff 'à l'ancienneté'. Quelle analyse est la plus juste ?",
      options: [
        "Dix ans dépassent la fourchette du Staff, la promotion est donc de droit et automatique",
        "Le niveau se juge sur le scope et l'impact ; les années sont indicatives",
        "Seule la fonction de manager permet d'atteindre le niveau Staff",
        "Il faut d'abord refuser, puis lui faire repasser un niveau mid pour valider",
      ],
      correctIndex: 1,
      explanation:
        "Les fourchettes d'années sont des repères : un Staff influence plusieurs équipes et la direction technique. Sans ce scope, l'ancienneté ne suffit pas, et le Staff n'est pas réservé aux managers.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/career/interview-tips": [
    {
      id: "career-interview-tips-1",
      question:
        "À 'Parlez-moi d'un conflit', un candidat répond toujours 'nous avons...'. Que lui manque-t-il dans sa réponse STAR ?",
      options: [
        "Une Action qui montre ce que lui-même a fait, pas l'équipe",
        "Une Situation plus longue, avec toute l'histoire de l'entreprise",
        "Un Résultat purement qualitatif, sans métrique, pour rester modeste",
        "Une Task décrivant les responsabilités de tous les participants",
      ],
      correctIndex: 0,
      explanation:
        "L'intervieweur évalue votre contribution : l'Action doit détailler ce que VOUS avez décidé et fait. Les autres éléments n'aident pas à isoler votre rôle.",
      difficulty: "easy",
    },
    {
      id: "career-interview-tips-2",
      question:
        "Vous concluez une histoire par 'et au final, ça s'est bien passé'. Comment renforcer le Result ?",
      options: [
        "Ajouter une anecdote sur l'ambiance de l'équipe pendant le projet",
        "Répéter l'Action en la détaillant davantage pour que le résultat paraisse évident",
        "Quantifier avec des métriques, par exemple temps de réponse réduit de 70 %",
        "Laisser l'intervieweur en tirer lui-même ses propres conclusions",
      ],
      correctIndex: 2,
      explanation:
        "Un résultat chiffré prouve l'impact et rend l'histoire vérifiable. 'Ça s'est bien passé' ne dit rien d'observable.",
      difficulty: "easy",
    },
    {
      id: "career-interview-tips-3",
      question:
        "En présentant un projet en 5 minutes, vous passez 4 minutes sur le contexte. Quelle correction est la plus pertinente ?",
      options: [
        "Supprimer résultats et apprentissages pour garder tout le contexte",
        "Raccourcir la solution à une phrase pour gagner du temps sur les questions",
        "Garder le contexte détaillé et parler plus vite pour tout faire entrer",
        "Réduire contexte et problème à environ 1 min et garder ~2 min pour la solution",
      ],
      correctIndex: 3,
      explanation:
        "La structure recommandée (contexte 30 s, problème 30 s, solution 2 min, résultats 1 min, apprentissages 1 min) concentre le temps sur le raisonnement et les résultats. Parler plus vite ne règle pas un déséquilibre.",
      difficulty: "medium",
    },
    {
      id: "career-interview-tips-4",
      question:
        "L'intervieweur conclut par 'Avez-vous des questions ?'. Quelle réponse sert le mieux votre candidature ?",
      options: [
        "'Non, tout est clair', pour ne pas lui faire perdre de temps",
        "Poser des questions préparées sur l'équipe, la stack et la dette technique",
        "Ne parler que des congés et du salaire pour lever toute ambiguïté",
        "Reposer des questions auxquelles il a déjà répondu pendant l'entretien",
      ],
      correctIndex: 1,
      explanation:
        "Des questions préparées montrent l'intérêt et la maturité, et vous aident à évaluer l'entreprise, car l'entretien va dans les deux sens. Se limiter aux avantages ou ne rien demander donne une mauvaise image.",
      difficulty: "medium",
    },
    {
      id: "career-interview-tips-5",
      question:
        "Après votre présentation d'un projet réussi, on vous demande : 'Que feriez-vous différemment ?' Quelle réponse est la meilleure ?",
      options: [
        "'Rien, le projet s'est déroulé de façon parfaite.'",
        "Reprocher à l'équipe les décisions qui ont causé les difficultés",
        "Énumérer longuement tout ce qui n'a pas fonctionné dans le projet et chez les autres",
        "Nommer un vrai compromis, l'alternative et ce que vous changeriez",
      ],
      correctIndex: 3,
      explanation:
        "La question teste la lucidité et la capacité d'apprentissage : un compromis concret avec son alternative montre votre raisonnement. Prétendre à la perfection ou blâmer les autres est un signal négatif.",
      difficulty: "hard",
    },
  ],
};
