import type { AreaExercises } from "./types";

export const aiMasteryExercises: AreaExercises = {
  "/tech-mastry/ai-mastery/prompt-engineering": [
    {
      id: "ai-mastery-prompt-engineering-match-1",
      type: "match",
      prompt: "Associez chaque technique de prompting à sa description.",
      pairs: [
        { term: "Zero-shot", definition: "Poser la question directement, sans exemple" },
        { term: "Few-shot", definition: "Fournir quelques exemples entrée-sortie dans le prompt" },
        { term: "Chain-of-thought", definition: "Demander de raisonner étape par étape avant de répondre" },
        { term: "Self-consistency", definition: "Générer plusieurs réponses et garder la plus fréquente" },
        { term: "Structured output", definition: "Imposer un format précis comme du JSON" },
      ],
      explanation:
        "Ces techniques se combinent : par exemple du few-shot avec une sortie structurée. Seule la self-consistency exige plusieurs appels au modèle.",
    },
    {
      id: "ai-mastery-prompt-engineering-order-1",
      type: "order",
      prompt: "Construisez un prompt structuré en remettant ses sections dans un ordre logique.",
      steps: [
        "Définir le rôle du modèle",
        "Donner le contexte et la tâche précise",
        "Fournir un ou deux exemples du résultat attendu",
        "Imposer le format de sortie",
        "Ajouter les contraintes (longueur, niveau, interdits)",
        "Tester sur des cas limites et itérer",
      ],
      explanation:
        "On pose d'abord qui, quoi et pour qui, puis la forme attendue. La dernière étape compte autant : un prompt se valide sur plusieurs cas, pas sur un seul essai.",
    },
    {
      id: "ai-mastery-prompt-engineering-classify-1",
      type: "classify",
      prompt: "Classez ces prompts en prompts solides ou faibles.",
      categories: ["Prompt solide", "Prompt faible"],
      items: [
        { text: "Résume ce ticket en 3 puces, au format JSON {titre, urgence}", category: 0 },
        { text: "Fais quelque chose de bien avec ce texte", category: 1 },
        { text: "Tu relis du code TypeScript d'API : liste 5 failles maximum par gravité", category: 0 },
        { text: "Sois parfait et ne te trompe jamais", category: 1 },
        { text: "Voici 3 exemples d'étiquetage, étiquette de la même façon le suivant", category: 0 },
        { text: "Améliore ça", category: 1 },
      ],
      explanation:
        "Un bon prompt précise la tâche, le contexte et le format. Les consignes vagues ou impossibles à vérifier laissent le modèle deviner.",
    },
  ],
  "/tech-mastry/ai-mastery/agentic-ai": [
    {
      id: "ai-mastery-agentic-ai-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la boucle d'un agent qui corrige un test en échec.",
      steps: [
        "Planifier : décider de lire le test et le code concerné",
        "Agir : appeler l'outil de lecture de fichiers",
        "Observer : lire le résultat et le message d'erreur",
        "Agir : modifier le code puis relancer les tests",
        "Vérifier : constater que les tests passent",
        "Conclure et rendre compte à l'utilisateur",
      ],
      explanation:
        "Un agent boucle entre raisonnement, action et observation. La vérification par les tests évite de déclarer le travail fini sans preuve.",
    },
    {
      id: "ai-mastery-agentic-ai-match-1",
      type: "match",
      prompt: "Associez chaque pattern ou notion agentique à sa description.",
      pairs: [
        { term: "ReAct", definition: "Alterne pensée, action et observation à chaque tour" },
        { term: "Plan & Execute", definition: "Établit un plan puis exécute ses étapes" },
        { term: "Orchestrateur", definition: "Agent qui distribue les tâches à des agents spécialisés" },
        { term: "Mémoire court terme", definition: "Contexte de la conversation en cours" },
        { term: "Mémoire long terme", definition: "Stockage persistant externe, comme une base vectorielle" },
      ],
      explanation:
        "Les patterns décrivent comment l'agent décide, les mémoires où il retrouve l'information. Seule la mémoire long terme survit à la session.",
    },
    {
      id: "ai-mastery-agentic-ai-classify-1",
      type: "classify",
      prompt: "Classez ces actions selon qu'un agent peut les faire seul ou qu'elles demandent la validation d'un humain.",
      categories: ["Seul", "Validation humaine"],
      items: [
        { text: "Lire des fichiers du dépôt", category: 0 },
        { text: "Lancer les tests unitaires", category: 0 },
        { text: "Supprimer une base de données", category: 1 },
        { text: "Pousser en production", category: 1 },
        { text: "Rechercher dans la documentation", category: 0 },
        { text: "Envoyer un e-mail à des clients", category: 1 },
      ],
      explanation:
        "Les actions en lecture ou réversibles peuvent être automatisées. Celles qui sont irréversibles ou visibles de l'extérieur demandent une validation humaine.",
    },
  ],
  "/tech-mastry/ai-mastery/claude-setup": [
    {
      id: "ai-mastery-claude-setup-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la mise en place d'un premier appel à l'API.",
      steps: [
        "Créer un compte et générer une clé API",
        "Stocker la clé dans .env.local et l'ignorer dans .gitignore",
        "Installer le SDK avec npm install @anthropic-ai/sdk",
        "Créer le client avec la clé lue depuis process.env",
        "Appeler messages.create avec un modèle et max_tokens",
      ],
      explanation:
        "La clé doit être protégée avant d'être utilisée dans du code. La lire depuis l'environnement évite de la committer par erreur.",
    },
    {
      id: "ai-mastery-claude-setup-fill-1",
      type: "fill",
      prompt: "Complétez le premier appel avec le SDK.",
      code: "const client = new Anthropic({\n  apiKey: process.env.{{1}},\n});\nconst message = await client.messages.{{2}}({\n  model: \"...\",\n  {{3}}: 1024,\n  messages: [{ role: \"user\", content: \"Bonjour\" }],\n});",
      blanks: [
        { options: ["PUBLIC_KEY", "ANTHROPIC_API_KEY", "CLAUDE_TOKEN"], answer: 1 },
        { options: ["send", "complete", "create"], answer: 2 },
        { options: ["max_tokens", "length", "limit"], answer: 0 },
      ],
      explanation:
        "La clé vient de ANTHROPIC_API_KEY, l'appel est client.messages.create et max_tokens borne la longueur de la réponse.",
    },
    {
      id: "ai-mastery-claude-setup-classify-1",
      type: "classify",
      prompt: "Classez chaque élément selon l'endroit où il doit se trouver.",
      categories: ["Dans le dépôt Git", "Hors du dépôt"],
      items: [
        { text: "CLAUDE.md décrivant les conventions du projet", category: 0 },
        { text: "La valeur de ANTHROPIC_API_KEY", category: 1 },
        { text: "Le fichier .env.local", category: 1 },
        { text: "Un .env.example sans valeur secrète", category: 0 },
        { text: "Les jetons d'accès des serveurs MCP", category: 1 },
        { text: "La liste des commandes de build et de test", category: 0 },
      ],
      explanation:
        "Le contexte du projet se partage par Git. Les secrets restent dans l'environnement de chacun, jamais dans un fichier versionné.",
    },
  ],
  "/tech-mastry/ai-mastery/copilot-setup": [
    {
      id: "ai-mastery-copilot-setup-match-1",
      type: "match",
      prompt: "Associez chaque mode de Copilot à son usage.",
      pairs: [
        { term: "Inline", definition: "Suggestions pendant la frappe, acceptées avec Tab" },
        { term: "Chat", definition: "Poser des questions sur le code et obtenir des explications" },
        { term: "Edit", definition: "Modifier du code avec un diff à accepter ou rejeter" },
        { term: "Agent", definition: "Enchaîner fichiers, commandes et outils MCP sur une tâche" },
      ],
      explanation:
        "Plus on monte dans la liste, plus l'outil agit seul. Edit garde un diff à valider, alors que l'agent exige une vigilance accrue.",
    },
    {
      id: "ai-mastery-copilot-setup-fill-1",
      type: "fill",
      prompt: "Complétez les références utilisées dans le chat Copilot.",
      code: "{{1}} Comment fonctionne l'auth ?\n{{2}}:auth.ts Explique cette fonction\n{{3}}  Génère des tests pour la sélection",
      blanks: [
        { options: ["#file", "/fix", "@workspace"], answer: 2 },
        { options: ["@vscode", "#file", "/explain"], answer: 1 },
        { options: ["/tests", "/fix", "@workspace"], answer: 0 },
      ],
      explanation:
        "@workspace interroge tout le projet, #file:nom cible un fichier, /tests est la commande de génération de tests.",
    },
    {
      id: "ai-mastery-copilot-setup-classify-1",
      type: "classify",
      prompt: "Pour chaque information, indiquez si elle a sa place dans copilot-instructions.md.",
      categories: ["Oui", "Non"],
      items: [
        { text: "Stack : Next.js, TypeScript strict, Tailwind", category: 0 },
        { text: "Validation Zod obligatoire sur les entrées", category: 0 },
        { text: "Le token GitHub de l'équipe", category: 1 },
        { text: "Le mot de passe de la base de production", category: 1 },
        { text: "Utiliser Vitest avec describe et it pour les tests", category: 0 },
        { text: "Une demande ponctuelle pour la tâche du jour", category: 1 },
      ],
      explanation:
        "Ce fichier versionné porte des conventions stables. Secrets et demandes ponctuelles n'y ont pas leur place.",
    },
  ],
  "/tech-mastry/ai-mastery/ai-tools": [
    {
      id: "ai-mastery-ai-tools-match-1",
      type: "match",
      prompt: "Associez chaque outil à sa catégorie.",
      pairs: [
        { term: "Cursor", definition: "IDE IA dérivé de VS Code" },
        { term: "Perplexity", definition: "Recherche IA avec citations" },
        { term: "v0", definition: "Générateur de composants UI React" },
        { term: "Bolt.new", definition: "Constructeur full-stack dans le navigateur" },
        { term: "Google AI Studio", definition: "Interface de prototypage des modèles Gemini" },
      ],
      explanation:
        "Connaître la catégorie d'un outil aide à choisir selon le besoin, car les noms et offres changent souvent.",
    },
    {
      id: "ai-mastery-ai-tools-classify-1",
      type: "classify",
      prompt: "Pour chaque besoin, choisissez le type d'outil le plus adapté.",
      categories: ["IDE IA", "Recherche IA", "Générateur d'UI"],
      items: [
        { text: "Refactorer plusieurs fichiers dans mon dépôt", category: 0 },
        { text: "Faire la veille sur une bibliothèque avec sources", category: 1 },
        { text: "Prototyper un composant de tableau de bord", category: 2 },
        { text: "Compléter du code pendant que je tape", category: 0 },
        { text: "Vérifier une affirmation grâce à des liens", category: 1 },
        { text: "Obtenir un formulaire React stylé en quelques secondes", category: 2 },
      ],
      explanation:
        "Un IDE agit sur votre code, un moteur de recherche sourcé sert à s'informer, un générateur d'UI sert à prototyper.",
    },
    {
      id: "ai-mastery-ai-tools-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la façon saine d'adopter un outil IA pour coder.",
      steps: [
        "Définir le besoin et les critères (contexte, coût, confidentialité)",
        "Présélectionner avec un comparatif",
        "Vérifier fonctions et tarifs sur le site officiel",
        "Essayer sur une petite tâche réelle",
        "Relire et tester le code généré avant de l'adopter",
      ],
      explanation:
        "Un comparatif sert de point de départ et vieillit vite. La décision se prend sur un essai réel, et le code généré se relit toujours.",
    },
  ],
  "/tech-mastry/ai-mastery/skills-agents": [
    {
      id: "ai-mastery-skills-agents-match-1",
      type: "match",
      prompt: "Associez chaque notion MCP à son rôle.",
      pairs: [
        { term: "Host (client)", definition: "Application qui initie la connexion, comme un IDE" },
        { term: "Tool", definition: "Action que le modèle peut appeler" },
        { term: "Resource", definition: "Donnée de contexte identifiée par une URI" },
        { term: "Prompt", definition: "Modèle de requête réutilisable" },
        { term: "stdio", definition: "Transport local par entrée et sortie standard" },
      ],
      explanation:
        "Un serveur expose Tools, Resources et Prompts à un hôte via JSON-RPC, sur un transport comme stdio pour le local.",
    },
    {
      id: "ai-mastery-skills-agents-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre la création d'un serveur MCP.",
      steps: [
        "Initialiser le projet et installer le SDK MCP et zod",
        "Définir les outils avec un schéma de paramètres",
        "Ajouter des resources si besoin de contexte",
        "Connecter le serveur à un transport stdio",
        "Déclarer le serveur dans la configuration du client",
      ],
      explanation:
        "Le serveur doit exister et être connectable avant que le client puisse le déclarer. Les schémas des outils sont définis avant le lancement.",
    },
    {
      id: "ai-mastery-skills-agents-fill-1",
      type: "fill",
      prompt: "Complétez la définition d'un outil MCP.",
      code: "server.{{1}}(\n  \"search_docs\",\n  \"Recherche dans la documentation\",\n  { query: z.{{2}}(), limit: z.number().{{3}}() },\n  async ({ query, limit = 5 }) => { /* ... */ }\n);",
      blanks: [
        { options: ["resource", "tool", "prompt"], answer: 1 },
        { options: ["number", "boolean", "string"], answer: 2 },
        { options: ["optional", "required", "nullable"], answer: 0 },
      ],
      explanation:
        "server.tool déclare une action avec un nom, une description et un schéma. limit a une valeur par défaut dans le handler, donc il est optionnel.",
    },
  ],
};
