export const PIPELINE_STEPS = [
  "Chargement",
  "Exploration",
  "Valeurs manquantes",
  "Types",
  "Outliers",
  "Feature Engineering",
  "Export",
];

export const CLEANING_PIPELINE_CODE = `import pandas as pd

# 1. Chargement
df = pd.read_csv("data.csv")

# pandas 3 : copy-on-write toujours actif, colonnes texte en dtype "str" par défaut
# 2. Exploration rapide
print(df.shape, df.dtypes)
print(df.describe())
print(df.isnull().sum())

# 3. Valeurs manquantes
# (pas de inplace=True sur une colonne : copy-on-write, pandas 3)
# Si le but est du ML : calculer la médiane sur le train uniquement
df["age"] = df["age"].fillna(df["age"].median())
df = df.dropna(subset=["target"])

# 4. Types
df["date"] = pd.to_datetime(df["date"])
df["category"] = df["category"].astype("category")

# 5. Outliers (IQR) — pour du ML, calculer Q1/Q3 sur le train seul (comme la médiane)
Q1, Q3 = df["salary"].quantile([0.25, 0.75])
IQR = Q3 - Q1
df = df[(df["salary"] >= Q1 - 1.5*IQR) & (df["salary"] <= Q3 + 1.5*IQR)]

# 6. Feature Engineering
df["age_group"] = pd.cut(df["age"], bins=[0,25,35,50,100], labels=["junior","mid","senior","expert"])

# 7. Export
df.to_parquet("clean_data.parquet", index=False)`;
