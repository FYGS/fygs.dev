/* ─────────── Main Page ─────────── */
export const algorithms = [
  {
    name: "Régression Linéaire",
    type: "Supervisé",
    task: "Régression",
    complexity: "O(n·d)",
    pros: "Simple, interprétable",
    cons: "Linéarité assumée",
  },
  {
    name: "Régression Logistique",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n·d)",
    pros: "Probabiliste, rapide",
    cons: "Frontière linéaire",
  },
  {
    name: "KNN",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(n·d)",
    pros: "Pas d'entraînement",
    cons: "Lent en prédiction",
  },
  {
    name: "Decision Tree",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(n·d·log n)",
    pros: "Interprétable",
    cons: "Overfitting facile",
  },
  {
    name: "Random Forest",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(k·n·d·log n)",
    pros: "Robust, ensemble",
    cons: "Boîte noire",
  },
  {
    name: "SVM",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n²·d)",
    pros: "Marges maximales",
    cons: "Lent sur gros data",
  },
  {
    name: "K-Means",
    type: "Non-supervisé",
    task: "Clustering",
    complexity: "O(n·k·d·i)",
    pros: "Simple, scalable",
    cons: "K à choisir",
  },
  {
    name: "PCA",
    type: "Non-supervisé",
    task: "Réduction dim.",
    complexity: "O(d²·n)",
    pros: "Réduit bruit",
    cons: "Perd interprétabilité",
  },
  {
    name: "XGBoost",
    type: "Supervisé",
    task: "Les deux",
    complexity: "O(k·n·d·log n)",
    pros: "État de l'art",
    cons: "Hyperparamètres",
  },
  {
    name: "Naive Bayes",
    type: "Supervisé",
    task: "Classification",
    complexity: "O(n·d)",
    pros: "Très rapide",
    cons: "Indépendance assumée",
  },
];

export const pipeline = [
  { step: "1. Collecte", desc: "Données brutes, API, CSV, bases de données" },
  {
    step: "2. EDA",
    desc: "Exploration, visualisations, statistiques descriptives",
  },
  {
    step: "3. Preprocessing",
    desc: "Nettoyage, encoding, feature engineering (scaling ajusté sur le train seul, après le split)",
  },
  {
    step: "4. Splitting",
    desc: "Train / Validation / Test (70/15/15 ou cross-validation)",
  },
  {
    step: "5. Entraînement",
    desc: "Sélection d'algorithme, GridSearchCV, hyperparamètres",
  },
  {
    step: "6. Évaluation",
    desc: "Métriques, courbe ROC, matrice de confusion",
  },
  { step: "7. Déploiement", desc: "Sérialisation du modèle, API, monitoring" },
];
