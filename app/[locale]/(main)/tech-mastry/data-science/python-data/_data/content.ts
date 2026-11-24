export const essentialLibs = [
  {
    name: "NumPy",
    desc: "Calcul numérique, tableaux N-dimensionnels, algèbre linéaire",
    usage: "import numpy as np",
    color: "text-blue-400",
  },
  {
    name: "Pandas",
    desc: "DataFrames, séries temporelles, nettoyage de données (pandas 3 : copy-on-write et dtype texte str par défaut)",
    usage: "import pandas as pd",
    color: "text-green-400",
  },
  {
    name: "Polars",
    desc: "DataFrames en Rust, évaluation paresseuse (lazy) et multithread, alternative à Pandas sur gros volumes",
    usage: "import polars as pl",
    color: "text-yellow-400",
  },
  {
    name: "Matplotlib",
    desc: "Graphiques statiques, personnalisation fine, subplots",
    usage: "import matplotlib.pyplot as plt",
    color: "text-purple-400",
  },
  {
    name: "Seaborn",
    desc: "Visualisations statistiques, thèmes élégants, intégration Pandas",
    usage: "import seaborn as sns",
    color: "text-cyan-400",
  },
  {
    name: "Scikit-learn",
    desc: "ML classique, preprocessing, métriques, pipelines",
    usage: "from sklearn import ...",
    color: "text-amber-400",
  },
  {
    name: "Jupyter",
    desc: "Notebooks interactifs, exploration, documentation vivante",
    usage: "jupyter notebook",
    color: "text-orange-400",
  },
];

export const pandasOps = [
  { op: "read_csv()", desc: "Charger un CSV", cat: "I/O" },
  {
    op: "head() / tail()",
    desc: "Premières / dernières lignes",
    cat: "Exploration",
  },
  { op: "describe()", desc: "Statistiques descriptives", cat: "Exploration" },
  { op: "groupby()", desc: "Agrégation par groupes", cat: "Transformation" },
  {
    op: "merge() / join()",
    desc: "Jointures de DataFrames",
    cat: "Transformation",
  },
  {
    op: "fillna() / dropna()",
    desc: "Gestion des valeurs manquantes",
    cat: "Nettoyage",
  },
  {
    op: "apply() / map()",
    desc: "Application de fonctions",
    cat: "Transformation",
  },
  { op: "pivot_table()", desc: "Tableaux croisés dynamiques", cat: "Analyse" },
  { op: "value_counts()", desc: "Distribution de valeurs", cat: "Exploration" },
  { op: "to_csv() / to_sql()", desc: "Export de données", cat: "I/O" },
];
