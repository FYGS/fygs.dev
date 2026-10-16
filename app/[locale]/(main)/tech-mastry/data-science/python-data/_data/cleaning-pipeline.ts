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

# 2. Exploration rapide
print(df.shape, df.dtypes)
print(df.describe())
print(df.isnull().sum())

# 3. Valeurs manquantes
df["age"].fillna(df["age"].median(), inplace=True)
df.dropna(subset=["target"], inplace=True)

# 4. Types
df["date"] = pd.to_datetime(df["date"])
df["category"] = df["category"].astype("category")

# 5. Outliers (IQR)
Q1, Q3 = df["salary"].quantile([0.25, 0.75])
IQR = Q3 - Q1
df = df[(df["salary"] >= Q1 - 1.5*IQR) & (df["salary"] <= Q3 + 1.5*IQR)]

# 6. Feature Engineering
df["age_group"] = pd.cut(df["age"], bins=[0,25,35,50,100], labels=["junior","mid","senior","expert"])

# 7. Export
df.to_parquet("clean_data.parquet", index=False)`;
