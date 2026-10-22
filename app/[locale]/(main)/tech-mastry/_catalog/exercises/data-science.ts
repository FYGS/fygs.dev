import type { AreaExercises } from "./types";

export const dataScienceExercises: AreaExercises = {
  "/tech-mastry/data-science/python-data": [
    {
      id: "data-science-python-data-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'un pipeline de nettoyage Pandas.",
      steps: [
        "Charger le fichier et explorer (shape, dtypes, describe)",
        "Compter et traiter les valeurs manquantes",
        "Corriger les types (dates, catégories)",
        "Détecter les outliers avec la règle de l'IQR",
        "Créer les nouvelles variables (feature engineering)",
        "Exporter le résultat en Parquet",
      ],
      explanation:
        "On explore d'abord pour savoir quoi nettoyer ; les types doivent être corrects avant de calculer des quantiles pour les outliers. L'export vient en dernier, une fois les données propres.",
    },
    {
      id: "data-science-python-data-fill-1",
      type: "fill",
      prompt: "Complétez ce code Pandas : moyenne des salaires par département, puis imputation de l'âge.",
      code: "df = pd.read_csv(\"data.csv\")\nmean_by_dept = df.{{1}}(\"dept\")[\"salary\"].{{2}}()\ndf[\"age\"] = df[\"age\"].{{3}}(df[\"age\"].median())",
      blanks: [
        { options: ["sort_values", "groupby", "merge", "apply"], answer: 1 },
        { options: ["head", "count_unique", "mean", "to_csv"], answer: 2 },
        { options: ["fillna", "dropna", "astype", "pivot"], answer: 0 },
      ],
      explanation:
        "groupby découpe par département, mean agrège chaque groupe, et fillna remplace les manquants par la médiane, plus robuste aux valeurs extrêmes que la moyenne. dropna supprimerait les lignes au lieu de les imputer.",
    },
  ],
  "/tech-mastry/data-science/statistics": [
    {
      id: "data-science-statistics-match-1",
      type: "match",
      prompt: "Associez chaque notion statistique à sa définition.",
      pairs: [
        { term: "Erreur de type I", definition: "Rejeter H0 alors qu'elle est vraie (faux positif)" },
        { term: "Erreur de type II", definition: "Ne pas rejeter H0 alors qu'elle est fausse (faux négatif)" },
        { term: "p-value", definition: "Probabilité d'un résultat au moins aussi extrême si H0 est vraie" },
        { term: "Z-score", definition: "Nombre d'écarts-types qui séparent une valeur de la moyenne" },
        { term: "Corrélation de Pearson", definition: "Mesure de la force d'une relation linéaire entre deux variables" },
      ],
      explanation:
        "La p-value se calcule en supposant H0 vraie : ce n'est donc pas la probabilité que H0 soit vraie. Pearson ne détecte que les relations linéaires.",
    },
    {
      id: "data-science-statistics-classify-1",
      type: "classify",
      prompt: "Un test donne p = 0,03. Classez ces phrases selon qu'elles interprètent correctement ou non ce résultat.",
      categories: ["Interprétation correcte", "Interprétation erronée"],
      items: [
        { text: "Si H0 était vraie, un résultat aussi extrême surviendrait dans 3 % des cas", category: 0 },
        { text: "H0 a 3 % de chances d'être vraie", category: 1 },
        { text: "On rejette H0 au seuil de 5 %", category: 0 },
        { text: "L'effet observé est forcément important", category: 1 },
        { text: "Le traitement est prouvé comme cause de la différence", category: 1 },
        { text: "Le résultat est statistiquement significatif à α = 0,05", category: 0 },
      ],
      explanation:
        "La p-value mesure la compatibilité des données avec H0, pas la probabilité de H0, la taille de l'effet ni la causalité. Seuls rejet de H0 et significativité découlent directement de p < α.",
    },
  ],
  "/tech-mastry/data-science/machine-learning": [
    {
      id: "data-science-machine-learning-order-1",
      type: "order",
      prompt: "Ordonnez un projet de classification sans fuite de données.",
      steps: [
        "Explorer les données (EDA)",
        "Séparer train et test de façon stratifiée",
        "Ajuster le prétraitement sur le train uniquement (Pipeline)",
        "Chercher les hyperparamètres par validation croisée sur le train",
        "Évaluer une seule fois sur le jeu de test",
        "Sérialiser le modèle, le déployer et le surveiller",
      ],
      explanation:
        "Le split vient avant tout ajustement du prétraitement : sinon le scaler voit le test. Le test n'est consulté qu'à la fin, sinon il sert à choisir le modèle et devient optimiste.",
    },
    {
      id: "data-science-machine-learning-fill-1",
      type: "fill",
      prompt: "Complétez le split puis la standardisation, sans que le test influence le scaler.",
      code: "X_train, X_test, y_train, y_test = {{1}}(X, y, test_size=0.2, stratify=y)\nscaler = StandardScaler()\nX_train_s = scaler.{{2}}(X_train)\nX_test_s = scaler.{{3}}(X_test)",
      blanks: [
        { options: ["cross_val_score", "train_test_split", "GridSearchCV"], answer: 1 },
        { options: ["fit_transform", "transform", "fit_predict"], answer: 0 },
        { options: ["fit_transform", "fit", "transform"], answer: 2 },
      ],
      explanation:
        "fit_transform apprend moyenne et écart-type sur le train ; le test doit seulement être transformé avec ces valeurs. Appeler fit_transform sur le test recalculerait les statistiques sur ses propres données.",
    },
    {
      id: "data-science-machine-learning-classify-1",
      type: "classify",
      prompt: "Classez ces algorithmes selon qu'ils apprennent avec ou sans étiquettes.",
      categories: ["Supervisé", "Non supervisé"],
      items: [
        { text: "KNN", category: 0 },
        { text: "K-Means", category: 1 },
        { text: "PCA", category: 1 },
        { text: "Random Forest", category: 0 },
        { text: "Régression logistique", category: 0 },
        { text: "Naive Bayes", category: 0 },
      ],
      explanation:
        "KNN contient « neighbors » comme K-Means mais exige des étiquettes pour voter. K-Means et PCA n'utilisent aucune cible : ils regroupent ou réduisent la dimension.",
    },
  ],
  "/tech-mastry/data-science/deep-learning": [
    {
      id: "data-science-deep-learning-order-1",
      type: "order",
      prompt: "Remettez dans l'ordre les étapes d'une itération d'entraînement PyTorch (gradients déjà remis à zéro).",
      steps: [
        "Calculer la sortie du modèle (forward)",
        "Calculer la loss avec le critère",
        "Rétropropager avec loss.backward()",
        "Écrêter les gradients (clip_grad_norm_)",
        "Mettre à jour les poids avec optimizer.step()",
      ],
      explanation:
        "On ne peut rétropropager qu'une loss déjà calculée, et on écrête les gradients avant que step() ne les utilise. Sans optimizer.zero_grad() au début de l'itération, les gradients s'accumuleraient d'un batch à l'autre.",
    },
    {
      id: "data-science-deep-learning-match-1",
      type: "match",
      prompt: "Associez chaque technique à son rôle dans l'entraînement d'un réseau.",
      pairs: [
        { term: "Dropout", definition: "Désactive des neurones au hasard à l'entraînement pour régulariser" },
        { term: "Batch normalization", definition: "Normalise les activations pour stabiliser l'entraînement" },
        { term: "Early stopping", definition: "Arrête l'entraînement quand la loss de validation remonte" },
        { term: "Transfer learning", definition: "Réutilise un modèle pré-entraîné puis l'affine sur ses données" },
        { term: "Data augmentation", definition: "Crée des variantes des exemples (rotation, flip, bruit)" },
      ],
      explanation:
        "Dropout, early stopping et data augmentation combattent le surapprentissage, alors que la batch normalization améliore surtout la stabilité. Le transfer learning compense le manque de données.",
    },
  ],
  "/tech-mastry/data-science/data-engineering": [
    {
      id: "data-science-data-engineering-order-1",
      type: "order",
      prompt: "Ordonnez les tâches du DAG Airflow d'un pipeline quotidien fiable.",
      steps: [
        "Extraire les données brutes de la source",
        "Valider la qualité (Great Expectations)",
        "Transformer vers la couche Gold",
        "Charger dans le data warehouse",
        "Notifier l'équipe du résultat",
      ],
      explanation:
        "Valider avant de transformer évite de propager des données défectueuses vers les couches suivantes. La notification vient en dernier pour refléter le résultat réel du chargement.",
    },
    {
      id: "data-science-data-engineering-classify-1",
      type: "classify",
      prompt: "Rangez ces descriptions dans la couche de l'architecture médaillon qui leur correspond.",
      categories: ["Bronze", "Silver", "Gold"],
      items: [
        { text: "Copie fidèle de la source, ingérée telle quelle", category: 0 },
        { text: "Données validées, dédupliquées, types corrigés", category: 1 },
        { text: "KPI agrégés par pays et par jour", category: 2 },
        { text: "Fichiers JSON bruts d'une API", category: 0 },
        { text: "Clés uniques et valeurs hors domaine écartées", category: 1 },
        { text: "Table prête pour un tableau de bord métier", category: 2 },
      ],
      explanation:
        "Bronze garde le brut pour pouvoir rejouer les traitements, Silver nettoie et fiabilise, Gold agrège pour l'usage métier. Nettoyer en Bronze ferait perdre la donnée d'origine.",
    },
  ],
  "/tech-mastry/data-science/mlops": [
    {
      id: "data-science-mlops-order-1",
      type: "order",
      prompt: "Ordonnez les étapes d'un pipeline CI/CD pour un modèle de machine learning.",
      steps: [
        "Lancer les tests unitaires",
        "Valider la qualité des données",
        "Entraîner et évaluer le modèle",
        "Appliquer les seuils de validation du modèle",
        "Construire le conteneur de service",
        "Déployer en canary à 10 % du trafic",
        "Promouvoir à 100 % si les métriques sont bonnes",
      ],
      explanation:
        "Chaque étape protège la suivante : données valides avant entraînement, seuils de performance avant déploiement, canary avant la promotion complète. Promouvoir directement exposerait tous les utilisateurs à un modèle non éprouvé.",
    },
    {
      id: "data-science-mlops-classify-1",
      type: "classify",
      prompt: "Classez chaque symptôme observé en production selon sa cause probable.",
      categories: ["Data drift", "Concept drift", "Infrastructure"],
      items: [
        { text: "La répartition des âges des clients change, la relation avec l'achat reste stable", category: 0 },
        { text: "Un PSI élevé apparaît sur la variable revenu", category: 0 },
        { text: "La précision chute alors que les distributions d'entrée sont stables", category: 1 },
        { text: "Les mêmes profils n'achètent plus pour les mêmes raisons", category: 1 },
        { text: "La latence p95 du service double", category: 2 },
        { text: "Le taux d'erreurs 5xx dépasse 0,1 %", category: 2 },
      ],
      explanation:
        "Le data drift concerne la distribution des entrées (PSI, KL), le concept drift la relation entrées-cible visible sur la qualité des prédictions. Latence et erreurs HTTP relèvent de l'infrastructure, pas du modèle.",
    },
  ],
};
