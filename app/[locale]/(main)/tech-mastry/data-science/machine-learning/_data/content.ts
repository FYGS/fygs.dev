/* ─────────── Main Page ─────────── */
export const algorithms = [
  {
    name: "Régression Linéaire",
    type: "Supervisé",
    task: "Régression",
    complexity: "Entr. O(n·d² + d³) (éq. normales) ou O(n·d) par epoch (SGD) · Préd. O(d)",
    pros: "Simple, interprétable",
    cons: "Linéarité assumée",
  },
  {
    name: "Régression Logistique",
    type: "Supervisé",
    task: "Classification",
    complexity: "Entr. O(n·d) par itération du solveur · Préd. O(d)",
    pros: "Probabiliste, rapide",
    cons: "Frontière linéaire",
  },
  {
    name: "KNN",
    type: "Supervisé",
    task: "Les deux",
    complexity: "Entr. O(1) (stockage des données) · Préd. O(n·d) par point (force brute)",
    pros: "Pas d'entraînement",
    cons: "Lent en prédiction",
  },
  {
    name: "Decision Tree",
    type: "Supervisé",
    task: "Les deux",
    complexity: "Entr. ≈ O(n·d·log n) (arbre équilibré) · Préd. O(profondeur)",
    pros: "Interprétable",
    cons: "Overfitting facile",
  },
  {
    name: "Random Forest",
    type: "Supervisé",
    task: "Les deux",
    complexity: "Entr. ≈ O(k·n·d′·log n) pour k arbres, d′ features testées par split · Préd. O(k·profondeur)",
    pros: "Robuste, ensemble",
    cons: "Boîte noire",
  },
  {
    name: "SVM",
    type: "Supervisé",
    task: "Classification",
    complexity: "Entr. entre O(n²·d) et O(n³) (SVM à noyau) ; O(n·d) par itération en linéaire · Préd. O(nsv·d)",
    pros: "Marges maximales",
    cons: "Lent sur gros data",
  },
  {
    name: "K-Means",
    type: "Non-supervisé",
    task: "Clustering",
    complexity: "Entr. O(n·k·d) par itération, ×i itérations · Préd. O(k·d)",
    pros: "Simple, scalable",
    cons: "K à choisir",
  },
  {
    name: "PCA",
    type: "Non-supervisé",
    task: "Réduction dim.",
    complexity: "Entr. O(n·d·min(n,d)) via SVD (O(n·d² + d³) via covariance) · Transf. O(d·c)",
    pros: "Réduit bruit",
    cons: "Perd interprétabilité",
  },
  {
    name: "XGBoost",
    type: "Supervisé",
    task: "Les deux",
    complexity: "Entr. ≈ O(T·n·d·log n) (exact) ou ≈ O(T·n·d) (histogrammes), T arbres · Préd. O(T·profondeur)",
    pros: "Très performant sur données tabulaires",
    cons: "Hyperparamètres",
  },
  {
    name: "Naive Bayes",
    type: "Supervisé",
    task: "Classification",
    complexity: "Entr. O(n·d) · Préd. O(c·d), c classes",
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
    step: "3. Splitting",
    desc: "Train / Validation / Test (70/15/15 ou cross-validation), avant tout ajustement",
  },
  {
    step: "4. Preprocessing",
    desc: "Nettoyage, encoding, feature engineering : scaler et imputer ajustés (fit) sur le train seul, puis appliqués à validation et test",
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
