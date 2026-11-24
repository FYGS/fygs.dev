import type { AreaExercises } from "./types";

export const careerExercises: AreaExercises = {
  "/tech-mastry/preparation": [
    {
      id: "career-preparation-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les grandes phases d'un plan de préparation sur 3 à 4 mois.",
      steps: [
        "Réviser les fondamentaux et identifier vos points faibles",
        "Pratiquer intensivement les algorithmes et le system design",
        "Commencer les mock interviews",
        "Cibler vos points faibles et augmenter la fréquence des mocks",
        "Révision légère, repos mental et logistique en dernière semaine",
      ],
      explanation:
        "Le diagnostic des faiblesses vient d'abord car il oriente tout le reste, et les mocks ne prennent leur sens qu'une fois la matière acquise. La dernière semaine sert à se reposer, pas à bachoter.",
    },
    {
      id: "career-preparation-classify-1",
      type: "classify",
      prompt: "Classez chaque comportement : erreur classique ou bonne pratique pendant un exercice technique.",
      categories: ["Erreur classique", "Bonne pratique"],
      items: [
        { text: "Coder en silence sans expliquer", category: 0 },
        { text: "Se lancer dans le code dès la lecture de l'énoncé", category: 0 },
        { text: "Ignorer les cas limites et les erreurs possibles", category: 0 },
        { text: "Reformuler le problème et poser des questions", category: 1 },
        { text: "Verbaliser son approche avant d'implémenter", category: 1 },
        { text: "Analyser la complexité et proposer une optimisation", category: 1 },
      ],
      explanation:
        "Les erreurs listées cachent votre raisonnement ou mènent à résoudre le mauvais problème. Les bonnes pratiques rendent votre démarche visible, ce que l'intervieweur évalue.",
    },
    {
      id: "career-preparation-match-1",
      type: "match",
      prompt: "Associez chaque échéance à l'objectif principal du plan de préparation.",
      pairs: [
        { term: "3-4 mois avant", definition: "Réviser les bases et établir un planning" },
        { term: "2-3 mois avant", definition: "Pratique intensive et début des mocks" },
        { term: "1 mois avant", definition: "Travailler les points faibles" },
        { term: "1 semaine avant", definition: "Révision légère et repos" },
      ],
      explanation:
        "L'intensité monte jusqu'à un mois avant puis redescend : la fin de parcours consolide au lieu d'apprendre du neuf, ce qui évite d'arriver épuisé.",
    },
  ],
  "/tech-mastry/preparation/mock-interviews": [
    {
      id: "career-mock-interviews-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'un entretien algorithme de 45 minutes.",
      steps: [
        "Introduction",
        "Clarification du problème",
        "Approche et pseudocode",
        "Implémentation",
        "Tests et optimisation",
        "Vos questions",
      ],
      explanation:
        "On clarifie et planifie avant de coder pour ne pas résoudre le mauvais problème. Les tests et l'optimisation suivent une implémentation correcte, et on garde un temps final pour ses questions.",
    },
    {
      id: "career-mock-interviews-match-1",
      type: "match",
      prompt: "Associez chaque type de mock interview à son conseil clé.",
      pairs: [
        { term: "Algorithme", definition: "Commencer par la force brute puis analyser la complexité" },
        { term: "System design", definition: "Demander les NFRs et calculer le throughput" },
        { term: "Behavioral", definition: "Préparer 5 histoires STAR quantifiées" },
      ],
      explanation:
        "Chaque format évalue autre chose : la démarche algorithmique, la gestion des contraintes de conception, la capacité à raconter des expériences réelles. Appliquer le conseil du mauvais format fait perdre du temps.",
    },
    {
      id: "career-mock-interviews-classify-1",
      type: "classify",
      prompt: "Rangez chaque élément dans l'entretien où il apparaît dans le plan type.",
      categories: ["Algorithme", "System design", "Behavioral"],
      items: [
        { text: "Tests avec des edge cases", category: 0 },
        { text: "Implémentation de 20 min", category: 0 },
        { text: "Estimation et contraintes", category: 1 },
        { text: "Deep dive d'un composant", category: 1 },
        { text: "Question STAR n°2", category: 2 },
        { text: "Tell me about yourself", category: 2 },
      ],
      explanation:
        "Chaque format a sa propre structure chronométrée. Savoir quelle étape appartient à quel entretien aide à répartir son temps correctement.",
    },
  ],
  "/tech-mastry/preparation/stress-management": [
    {
      id: "career-stress-management-order-1",
      type: "order",
      prompt: "Une crise d'angoisse arrive en pleine visio. Remettez dans l'ordre une réaction apaisante.",
      steps: [
        "Reconnaître calmement que le stress monte",
        "Respirer lentement en 4-7-8, 3 ou 4 fois",
        "Faire un grounding 5-4-3-2-1 si l'angoisse persiste",
        "Recadrer : bloquer est normal, je réfléchis à voix haute",
        "Reprendre l'exercice en verbalisant",
      ],
      explanation:
        "On agit d'abord sur le corps (respiration, sens) puis sur la pensée (recadrage) avant de reprendre. Repartir tout de suite sans retomber au calme laisse l'angoisse piloter la suite.",
    },
    {
      id: "career-stress-management-fill-1",
      type: "fill",
      prompt: "Complétez le rituel de préparation autour de l'entretien.",
      code: "La veille : {{1}} et un repas léger.\nLe matin : visualisation positive.\n5 minutes avant, en privé : {{2}}.\nSi une pensée négative apparaît : {{3}}.",
      blanks: [
        { options: ["une nuit de révisions", "7-8 h de sommeil", "un repas copieux tardif"], answer: 1 },
        { options: ["un power posing de 2 minutes", "une relecture de dernière minute", "un grounding à voix haute"], answer: 0 },
        { options: ["la supprimer de force", "la recadrer en opportunité d'apprentissage", "reporter l'entretien"], answer: 1 },
      ],
      explanation:
        "Le sommeil précède l'épreuve, le power posing se pratique en privé juste avant, et le recadrage traite la pensée au lieu de la combattre. Se priver de sommeil ou forcer une pensée à disparaître aggrave le stress.",
    },
    {
      id: "career-stress-management-classify-1",
      type: "classify",
      prompt: "Classez ces pensées : stressante ou recadrée.",
      categories: ["Pensée stressante", "Pensée recadrée"],
      items: [
        { text: "Je dois être parfait", category: 0 },
        { text: "Ils vont me piéger", category: 0 },
        { text: "C'est un examen", category: 0 },
        { text: "Je dois montrer comment je réfléchis", category: 1 },
        { text: "Ils veulent me voir réussir", category: 1 },
        { text: "C'est une conversation entre professionnels", category: 1 },
      ],
      explanation:
        "Les pensées recadrées déplacent l'enjeu de la perfection vers la démarche et la collaboration. Les pensées stressantes transforment l'entretien en piège, ce qui dégrade la performance.",
    },
  ],
  "/tech-mastry/career/salary-negotiation": [
    {
      id: "career-salary-negotiation-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les 5 étapes du framework de négociation.",
      steps: [
        "Rechercher le marché",
        "Définir minimum, cible et aspiration haute",
        "Construire l'argumentaire chiffré",
        "Négocier après l'offre de l'employeur",
        "Obtenir l'accord final par écrit",
      ],
      explanation:
        "Sans données de marché et sans chiffres définis, l'argumentaire n'a pas de base. Négocier avant d'être préparé donne la main à l'employeur ; l'écrit vient en dernier pour sécuriser l'accord.",
    },
    {
      id: "career-salary-negotiation-match-1",
      type: "match",
      prompt: "Associez chaque notion de négociation à sa définition.",
      pairs: [
        { term: "Minimum acceptable", definition: "Chiffre en dessous duquel vous refusez" },
        { term: "Cible réaliste", definition: "Ce que vous visez raisonnablement" },
        { term: "Aspiration haute", definition: "Meilleur scénario ambitieux mais justifiable" },
        { term: "Package total", definition: "Salaire plus bonus, equity et avantages" },
      ],
      explanation:
        "Définir ces repères avant d'entrer en discussion évite de décider sous pression. Raisonner sur le package total empêche de se focaliser uniquement sur le salaire de base.",
    },
    {
      id: "career-salary-negotiation-fill-1",
      type: "fill",
      prompt: "Complétez la phrase d'ouverture de la contre-proposition.",
      code: "Je suis très {{1}} pour ce poste. Basé sur mes {{2}} et mon expérience, je visais plutôt {{3}}. Est-ce quelque chose que nous pouvons explorer ?",
      blanks: [
        { options: ["déçu", "enthousiaste", "indifférent"], answer: 1 },
        { options: ["recherches de marché", "envies du moment", "dettes personnelles"], answer: 0 },
        { options: ["le salaire que j'ai actuellement", "un chiffre précis et justifié", "n'importe quelle augmentation"], answer: 1 },
      ],
      explanation:
        "On exprime l'enthousiasme, on s'appuie sur des données de marché et on annonce un chiffre justifiable. Le salaire actuel ou une demande vague affaiblit l'ancrage.",
    },
  ],
  "/tech-mastry/career/progression": [
    {
      id: "career-progression-match-1",
      type: "match",
      prompt: "Associez chaque niveau de la ladder à son scope.",
      pairs: [
        { term: "Junior", definition: "Tâches individuelles" },
        { term: "Mid-Level", definition: "Features complètes" },
        { term: "Senior", definition: "Système ou équipe" },
        { term: "Staff", definition: "Multi-équipes ou organisation" },
        { term: "Principal", definition: "Entreprise ou industrie" },
      ],
      explanation:
        "Le niveau se mesure à l'étendue de l'impact, pas à la seule difficulté technique. C'est ce scope qu'il faut démontrer pour monter.",
    },
    {
      id: "career-progression-order-1",
      type: "order",
      prompt: "Remettez les niveaux dans l'ordre de progression.",
      steps: ["Junior", "Mid-Level", "Senior", "Staff", "Principal"],
      explanation:
        "L'échelle croît en autonomie puis en influence : individu, feature, équipe, multi-équipes, entreprise. Confondre Senior et Staff revient à ignorer le saut de scope.",
    },
    {
      id: "career-progression-classify-1",
      type: "classify",
      prompt: "Classez ces comportements selon le niveau auquel ils correspondent le mieux.",
      categories: ["Junior", "Senior", "Staff"],
      items: [
        { text: "Livrer des features avec l'aide d'un mentor", category: 0 },
        { text: "Suivre les conventions de l'équipe", category: 0 },
        { text: "Multiplier la productivité de l'équipe", category: 1 },
        { text: "Définir l'architecture d'un nouveau système", category: 1 },
        { text: "Définir la direction technique de l'organisation", category: 2 },
        { text: "Construire des ponts entre les équipes", category: 2 },
      ],
      explanation:
        "Le junior apprend et exécute, le senior conçoit et amplifie son équipe, le staff oriente plusieurs équipes. Le critère est l'étendue de l'influence.",
    },
  ],
  "/tech-mastry/career/interview-tips": [
    {
      id: "career-interview-tips-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les lettres de la méthode STAR avec leur contenu.",
      steps: [
        "Situation : le contexte, précis et concis",
        "Task : votre responsabilité dans cette situation",
        "Action : ce que VOUS avez fait concrètement",
        "Result : le résultat quantifié",
      ],
      explanation:
        "L'ordre suit le fil narratif : contexte, rôle, actions, impact. Commencer par le résultat ou passer vite sur l'action empêche d'évaluer votre contribution.",
    },
    {
      id: "career-interview-tips-fill-1",
      type: "fill",
      prompt: "Complétez cette réponse STAR.",
      code: "Situation : notre monolithe servait 10M d'utilisateurs avec des temps de réponse dégradés.\nTask : {{1}}.\nAction : {{2}}.\nResult : {{3}}.",
      blanks: [
        { options: ["l'équipe devait réfléchir à une solution", "j'étais responsable de concevoir et mener la migration", "tout le monde avait un avis sur la question"], answer: 1 },
        { options: ["j'ai défini l'architecture cible et formé 8 développeurs", "nous avons fait de notre mieux", "la direction a pris les décisions"], answer: 0 },
        { options: ["le projet s'est bien passé", "tout le monde était content", "temps de réponse réduit de 70 %"], answer: 2 },
      ],
      explanation:
        "Une bonne réponse utilise le « je » pour la Task et l'Action, puis une métrique pour le Result. Les formulations collectives ou vagues ne montrent ni votre rôle ni votre impact.",
    },
    {
      id: "career-interview-tips-classify-1",
      type: "classify",
      prompt: "Classez ces réponses ou questions de fin d'entretien : à privilégier ou à éviter.",
      categories: ["À privilégier", "À éviter"],
      items: [
        { text: "Comment gérez-vous la dette technique ?", category: 0 },
        { text: "À quoi ressemble une journée type ?", category: 0 },
        { text: "Expliquer les alternatives considérées et le choix fait", category: 0 },
        { text: "Dire « nous » pour toute l'Action d'une histoire STAR", category: 1 },
        { text: "Répondre « non, pas de questions »", category: 1 },
        { text: "Résumer un résultat par « ça s'est bien passé »", category: 1 },
      ],
      explanation:
        "Les intervieweurs veulent voir votre raisonnement et votre intérêt pour l'équipe. Les réponses collectives, vagues ou passives masquent l'un et l'autre.",
    },
  ],
};
