import type { AreaExercises } from "./types";

export const architectureExercises: AreaExercises = {
  "/tech-mastry/architecture/solid": [
    {
      id: "architecture-solid-classify-1",
      type: "classify",
      prompt: "Pour chaque symptôme de conception, indiquez le principe SOLID violé.",
      explanation:
        "Chaque symptôme pointe vers une cause précise : plusieurs raisons de changer (SRP), modification au lieu d'extension (OCP), contrat de base cassé par un sous-type (LSP), création directe d'un détail concret (DIP).",
      categories: ["Responsabilité unique", "Ouvert/Fermé", "Liskov", "Inversion de dépendance"],
      items: [
        { text: "Une classe calcule la TVA, génère le PDF et envoie l'email", category: 0 },
        { text: "Un changement de format de rapport touche la classe de calcul des règles", category: 0 },
        { text: "Ajouter Apple Pay oblige à modifier un grand if/else existant", category: 1 },
        { text: "Square redéfinit setWidth et fausse l'aire attendue d'un Rectangle", category: 2 },
        { text: "OrderService fait new PostgresRepository() dans son constructeur", category: 3 },
        { text: "Le métier importe directement le client SDK d'un fournisseur", category: 3 },
      ],
    },
    {
      id: "architecture-solid-fill-1",
      type: "fill",
      prompt: "Complétez ce code pour qu'il respecte Ouvert/Fermé et l'inversion de dépendance.",
      explanation:
        "Checkout dépend de l'abstraction PaymentMethod, pas de PaypalPayment : on ajoute un moyen de paiement en écrivant une nouvelle classe, et la concrétisation est choisie à la composition.",
      code: "interface PaymentMethod { pay(amount: number): void }\nclass PaypalPayment implements {{1}} {\n  pay(amount: number) { /* ... */ }\n}\nclass Checkout {\n  constructor(private method: {{2}}) {}\n}\nconst checkout = new Checkout({{3}});",
      blanks: [
        { options: ["Checkout", "PaymentMethod", "PaypalPayment"], answer: 1 },
        { options: ["PaymentMethod", "PaypalPayment", "string"], answer: 0 },
        { options: ["PaymentMethod", "new PaypalPayment()", "PaypalPayment"], answer: 1 },
      ],
    },
  ],
  "/tech-mastry/architecture/design-patterns": [
    {
      id: "architecture-design-patterns-match-1",
      type: "match",
      prompt: "Associez chaque pattern à son intention.",
      explanation:
        "Adapter et Decorator enveloppent tous deux un objet, mais l'un change l'interface alors que l'autre la conserve pour ajouter du comportement. Strategy varie l'algorithme, Observer propage un changement d'état.",
      pairs: [
        { term: "Adapter", definition: "Traduit une interface incompatible vers celle attendue" },
        { term: "Decorator", definition: "Ajoute un comportement en enveloppant un objet de même interface" },
        { term: "Strategy", definition: "Rend un algorithme interchangeable à l'exécution" },
        { term: "Observer", definition: "Notifie des abonnés quand un état change" },
        { term: "Singleton", definition: "Garantit une instance unique accessible globalement" },
      ],
    },
    {
      id: "architecture-design-patterns-classify-1",
      type: "classify",
      prompt: "Rangez chaque pattern dans sa famille du catalogue GoF.",
      explanation:
        "Les patterns de création gèrent l'instanciation, ceux de structure la composition d'objets, ceux de comportement la répartition des responsabilités et des échanges.",
      categories: ["Création", "Structure", "Comportement"],
      items: [
        { text: "Singleton", category: 0 },
        { text: "Factory Method", category: 0 },
        { text: "Adapter", category: 1 },
        { text: "Decorator", category: 1 },
        { text: "Observer", category: 2 },
        { text: "Strategy", category: 2 },
      ],
    },
  ],
  "/tech-mastry/architecture/clean-architecture": [
    {
      id: "architecture-clean-architecture-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre le parcours d'une requête de création de commande à travers les couches.",
      explanation:
        "Le flux de contrôle traverse les couches de l'extérieur vers l'intérieur puis ressort, mais le use case ne connaît que le port OrderRepository : c'est l'adaptateur Prisma qui dépend de lui, jamais l'inverse.",
      steps: [
        "Le controller convertit la requête HTTP en entrée du use case",
        "Le use case instancie l'entité Order, qui valide ses règles métier",
        "Le use case appelle le port OrderRepository",
        "L'adaptateur Prisma qui implémente le port écrit en base",
        "Le presenter formate le résultat en JSON pour la réponse",
      ],
    },
    {
      id: "architecture-clean-architecture-classify-1",
      type: "classify",
      prompt: "Placez chaque élément dans la couche de la Clean Architecture à laquelle il appartient.",
      explanation:
        "Les règles générales vont dans les entités, les règles propres à l'application dans les use cases, les convertisseurs dans les adaptateurs, et les outils (base, UI) dans la couche externe.",
      categories: ["Entities", "Use Cases", "Interface Adapters", "Frameworks & Drivers"],
      items: [
        { text: "Invoice", category: 0 },
        { text: "Order.canBeCancelled()", category: 0 },
        { text: "AuthenticateUser", category: 1 },
        { text: "CreateOrder", category: 1 },
        { text: "OrderController", category: 2 },
        { text: "Presenter qui produit le JSON", category: 2 },
        { text: "PostgreSQL et Prisma", category: 3 },
        { text: "Interface React", category: 3 },
      ],
    },
  ],
  "/tech-mastry/architecture/ddd": [
    {
      id: "architecture-ddd-match-1",
      type: "match",
      prompt: "Associez chaque concept du DDD à sa définition.",
      explanation:
        "L'Aggregate fixe la frontière de cohérence, le Bounded Context la frontière du modèle, le Repository l'accès à la collection d'Aggregates, et le Domain Event relie les contextes sans les coupler.",
      pairs: [
        { term: "Bounded Context", definition: "Frontière dans laquelle un modèle et son langage restent cohérents" },
        { term: "Aggregate", definition: "Groupe d'objets modifié via sa racine qui garantit les invariants" },
        { term: "Value Object", definition: "Objet immuable défini uniquement par ses valeurs" },
        { term: "Domain Event", definition: "Fait métier passé publié pour que d'autres réagissent" },
        { term: "Repository", definition: "Interface du domaine qui donne accès aux Aggregates" },
        { term: "Entity", definition: "Objet défini par son identité à travers le temps" },
      ],
    },
    {
      id: "architecture-ddd-classify-1",
      type: "classify",
      prompt: "Classez chaque concept comme Entity ou comme Value Object.",
      explanation:
        "Si deux instances aux mêmes valeurs sont interchangeables, c'est un Value Object ; si l'on doit suivre une même chose dans le temps malgré ses changements d'état, c'est une Entity.",
      categories: ["Entity", "Value Object"],
      items: [
        { text: "Customer identifié par son customerId", category: 0 },
        { text: "Order dont le statut évolue", category: 0 },
        { text: "Payment tracé par un identifiant de transaction", category: 0 },
        { text: "Money : 10 EUR", category: 1 },
        { text: "Email validé et immuable", category: 1 },
        { text: "Période avec date de début et de fin", category: 1 },
      ],
    },
  ],
};
