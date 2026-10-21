import type { AreaQuizzes } from "./types";

export const dataScienceQuizzes: AreaQuizzes = {
  "/tech-mastry/data-science/python-data": [
    {
      id: "data-science-python-data-1",
      question:
        "La colonne salary est très asymétrique, avec quelques salaires extrêmes. Quelle valeur d'imputation est la plus robuste pour les valeurs manquantes ?",
      options: [
        "La médiane, peu influencée par les valeurs extrêmes",
        "La moyenne, car elle exploite toutes les valeurs observées",
        "Le mode, car c'est la valeur la plus fréquente de la colonne",
        "Zéro, afin de repérer facilement les lignes incomplètes",
      ],
      correctIndex: 0,
      explanation:
        "La médiane ne bouge presque pas quand quelques valeurs sont très grandes, alors que la moyenne est tirée vers elles. Remplacer par zéro fausserait les statistiques en créant des salaires nuls irréalistes.",
      difficulty: "easy",
    },
    {
      id: "data-science-python-data-2",
      question: "Quelle expression Pandas calcule le salaire moyen par département ?",
      options: [
        "df[\"salary\"].mean(by=\"dept\")",
        "df.sort_values(\"dept\")[\"salary\"].mean()",
        "df.groupby(\"dept\")[\"salary\"].mean()",
        "df.pivot_table(\"dept\", values=\"salary\")",
      ],
      correctIndex: 2,
      explanation:
        "groupby découpe par département puis agrège chaque groupe. Trier avant de calculer la moyenne renvoie seulement la moyenne globale, et mean n'a pas de paramètre by.",
      difficulty: "easy",
    },
    {
      id: "data-science-python-data-3",
      question:
        "Q1 = 40 k€ et Q3 = 60 k€ sur la colonne salary. Quelles valeurs la règle 1,5 x IQR classe-t-elle comme outliers ?",
      options: [
        "Moins de 20 k€ ou plus de 80 k€",
        "Moins de 30 k€ ou plus de 70 k€",
        "Moins de 0 k€ ou plus de 100 k€",
        "Moins de 10 k€ ou plus de 90 k€",
      ],
      correctIndex: 3,
      explanation:
        "IQR = 20, donc les bornes sont Q1 - 30 = 10 et Q3 + 30 = 90. Les autres choix correspondent à 1 x IQR, 0,5 x IQR et 3 x IQR.",
      difficulty: "medium",
    },
    {
      id: "data-science-python-data-4",
      question:
        "Quel est le résultat de ce code NumPy ?\n\na = np.array([[1, 2, 3], [4, 5, 6]])\nb = np.array([10, 20, 30])\nprint(a + b)",
      options: [
        "[[11, 22, 33], [14, 25, 36]] : b est ajouté à chaque ligne",
        "[[11, 12, 13], [24, 25, 26]] : b est ajouté à chaque colonne",
        "[[11, 22, 33], [4, 5, 6]] : seule la première ligne est modifiée",
        "Une ValueError, car les deux tableaux n'ont pas la même forme",
      ],
      correctIndex: 0,
      explanation:
        "Par broadcasting, la forme (3,) est étendue à (2, 3) en alignant les dernières dimensions, donc b s'ajoute à chaque ligne. La deuxième réponse correspondrait à un vecteur colonne de forme (2, 1).",
      difficulty: "medium",
    },
    {
      id: "data-science-python-data-5",
      question:
        "Avec le copy-on-write (comportement par défaut de pandas 3), que produit cette ligne du pipeline de nettoyage ?\n\ndf[\"age\"].fillna(df[\"age\"].median(), inplace=True)",
      options: [
        "Elle modifie df en place, comme avec les anciennes versions",
        "Elle n'a aucun effet sur df ; il faut écrire df[\"age\"] = df[\"age\"].fillna(...)",
        "Elle supprime les lignes contenant des valeurs manquantes de la colonne age uniquement",
        "Elle lève une erreur car median() ne gère pas les NaN",
      ],
      correctIndex: 1,
      explanation:
        "df[\"age\"] est un objet intermédiaire : l'opération inplace ne remonte pas dans df (chained assignment), et les anciennes versions émettaient déjà un avertissement. L'affectation explicite fonctionne partout, et median() ignore les NaN par défaut.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/data-science/statistics": [
    {
      id: "data-science-statistics-1",
      question:
        "Des notes suivent une loi normale de moyenne 50 et d'écart-type 10. Quelle part des notes se situe approximativement entre 30 et 70 ?",
      options: [
        "Environ 68 %, soit un écart-type de chaque côté",
        "Environ 95 %, soit deux écarts-types de chaque côté",
        "Environ 99,7 %, soit trois écarts-types de chaque côté",
        "Environ 50 %, soit la moitié de la population centrale",
      ],
      correctIndex: 1,
      explanation:
        "30 et 70 sont à 2 écarts-types de la moyenne, ce qui couvre environ 95,4 % des valeurs. 68 % correspond à l'intervalle 40-60 et 99,7 % à 20-80.",
      difficulty: "easy",
    },
    {
      id: "data-science-statistics-2",
      question:
        "Un test donne p = 0,03 avec un seuil α = 0,05. Quelle interprétation est correcte ?",
      options: [
        "H0 a 3 % de chances d'être vraie, donc H1 l'est à 97 %",
        "L'effet observé est important puisque la p-value est sous 0,05 selon le seuil de 0,05 fixé",
        "Le test prouve que le traitement est la cause de la différence",
        "Sous H0, un résultat aussi extrême survient dans 3 % des cas : on rejette H0",
      ],
      correctIndex: 3,
      explanation:
        "La p-value est calculée en supposant H0 vraie ; ce n'est pas la probabilité de H0 elle-même. Elle ne mesure ni la taille de l'effet ni la causalité.",
      difficulty: "easy",
    },
    {
      id: "data-science-statistics-3",
      question:
        "Une équipe teste 20 métriques sans correction au seuil de 5 % et publie la seule qui sort avec p = 0,04. Quel est le problème principal ?",
      options: [
        "Le risque de faux positif est gonflé : environ 64 % de chances d'en obtenir au moins un par hasard",
        "Le risque de type II augmente, donc de vrais effets sont systématiquement manqués ; il faudrait donc augmenter la taille de l'échantillon",
        "Aucun problème, puisque chaque test garde individuellement un risque de 5 %",
        "L'échantillon est biaisé, ce qui rend toute p-value inutilisable",
      ],
      correctIndex: 0,
      explanation:
        "Avec 20 tests indépendants, la probabilité d'au moins un faux positif est 1 - 0,95^20, soit environ 64 %. Il faut corriger (Bonferroni, Benjamini-Hochberg) ou prédéfinir une seule métrique principale.",
      difficulty: "medium",
    },
    {
      id: "data-science-statistics-4",
      question:
        "On mesure x, symétrique autour de 0, et y = x². Le coefficient de Pearson vaut r ≈ 0. Quelle conclusion tirer ?",
      options: [
        "x et y sont indépendantes, on peut ignorer x pour expliquer y",
        "Pearson ne mesure que le linéaire : la relation existe, mais elle est non linéaire",
        "Le calcul est faux, car y dépend de x donc r devrait être proche de 1",
        "La corrélation est faible, donc un modèle quadratique sera forcément mauvais ; mieux vaut éviter les termes quadratiques",
      ],
      correctIndex: 1,
      explanation:
        "y est entièrement déterminée par x, mais en forme de parabole, ce qui annule la covariance linéaire. Toujours tracer le nuage de points avant de conclure sur un r proche de 0.",
      difficulty: "medium",
    },
    {
      id: "data-science-statistics-5",
      question:
        "Un test A/B sur 2 millions d'utilisateurs donne p = 0,0001 pour un gain de conversion de +0,05 point. Quelle est la décision la plus judicieuse ?",
      options: [
        "Déployer sans réserve, car p < 0,05 prouve que le gain est important et qu'il n'y a plus rien à analyser",
        "Se méfier du résultat, car une p-value aussi faible avec autant de données est suspecte",
        "Évaluer taille d'effet et intervalle de confiance : significatif ne veut pas dire utile",
        "Refaire le test avec un seuil α de 0,00001 pour confirmer la significativité",
      ],
      correctIndex: 2,
      explanation:
        "Avec un très grand échantillon, des effets minuscules deviennent statistiquement significatifs. La décision doit comparer le gain réel (avec son intervalle) au coût du changement, pas se limiter à la p-value.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/data-science/machine-learning": [
    {
      id: "data-science-machine-learning-1",
      question:
        "Vous voulez regrouper des clients en segments, sans aucune étiquette préalable. Quel algorithme de la liste convient ?",
      options: [
        "KNN, car il regroupe les points proches les uns des autres",
        "La régression logistique, car elle sépare les clients en groupes",
        "K-Means, qui partitionne les points en k clusters sans étiquette",
        "Random Forest, qui découvre automatiquement les segments en testant plusieurs partitions",
      ],
      correctIndex: 2,
      explanation:
        "K-Means est non supervisé : il n'a besoin d'aucune cible. KNN, la régression logistique et Random Forest sont supervisés et exigent des étiquettes.",
      difficulty: "easy",
    },
    {
      id: "data-science-machine-learning-2",
      question:
        "Un modèle atteint 99 % d'accuracy sur le jeu d'entraînement mais 72 % sur le jeu de test. Quel est le diagnostic le plus probable ?",
      options: [
        "Surapprentissage : simplifier ou régulariser le modèle, ou ajouter des données",
        "Sous-apprentissage : il faut un modèle plus complexe pour le train",
        "Fuite de données du test vers l'entraînement, ce qui gonflerait le test et expliquerait cet écart",
        "Le jeu de test est trop petit, il suffit de l'agrandir pour réduire l'écart",
      ],
      correctIndex: 0,
      explanation:
        "Un score excellent sur le train et nettement plus faible sur le test traduit une mémorisation du bruit. Un sous-apprentissage donnerait de mauvais scores sur le train aussi.",
      difficulty: "easy",
    },
    {
      id: "data-science-machine-learning-3",
      question:
        "Matrice de confusion d'un classifieur : TP = 40, FP = 10, FN = 20, TN = 930. Quelles sont la précision et le rappel de la classe positive ?",
      options: [
        "Précision 67 %, rappel 80 %",
        "Précision 80 %, rappel 67 %",
        "Précision 97 %, rappel 80 %",
        "Précision 80 %, rappel 40 %",
      ],
      correctIndex: 1,
      explanation:
        "Précision = TP / (TP + FP) = 40 / 50 = 80 %, rappel = TP / (TP + FN) = 40 / 60 = 67 %. Le 97 % correspond à l'accuracy globale, pas à la précision.",
      difficulty: "medium",
    },
    {
      id: "data-science-machine-learning-4",
      question:
        "Quel est le défaut de ce code ?\n\nX = StandardScaler().fit_transform(X)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y)\nmodel.fit(X_tr, y_tr)\nmodel.score(X_te, y_te)",
      options: [
        "Le scaler ne devrait s'appliquer qu'à la cible y, pas aux variables X",
        "La standardisation doit venir après l'évaluation pour comparer les scores des modèles entraînés",
        "Le scaler voit le jeu de test (fuite) : à ajuster sur le train, via un Pipeline",
        "Aucun, car standardiser ne dépend pas des valeurs des données",
      ],
      correctIndex: 2,
      explanation:
        "La moyenne et l'écart-type calculés sur tout X intègrent des informations du test, donc le score est légèrement optimiste. Un Pipeline ajusté sur le train évite cette fuite, y compris dans la validation croisée.",
      difficulty: "medium",
    },
    {
      id: "data-science-machine-learning-5",
      question:
        "GridSearchCV avec cv=5 renvoie un best_score_ de 0,91. Pourquoi garder un jeu de test intact et ne le scorer qu'une fois à la fin ?",
      options: [
        "Pour entraîner le modèle final sur davantage de données qu'en validation croisée ; le test ne sert qu'à cela",
        "Parce que la validation croisée ne produit jamais de score exploitable",
        "Pour augmenter le nombre de plis et réduire la variance de l'estimation",
        "Le meilleur score CV est optimiste, car choisi parmi plusieurs combinaisons d'hyperparamètres",
      ],
      correctIndex: 3,
      explanation:
        "Sélectionner le maximum parmi de nombreux essais biaise le score à la hausse (sélection sur les mêmes plis). Seul un test jamais utilisé pour choisir donne une estimation honnête de la performance en production.",
      difficulty: "hard",
    },
    {
      id: "data-science-machine-learning-6",
      question:
        "En détection de fraude (0,5 % de fraudes), un modèle qui prédit toujours « légitime » obtient 99,5 % d'accuracy. Que conclure et quoi suivre ?",
      options: [
        "Le modèle est excellent : l'accuracy suffit dès qu'elle dépasse 99 %",
        "Il est inutile (rappel nul) ; suivre rappel, précision et PR-AUC sur la classe fraude",
        "Il est inutile ; il suffit de remplacer l'accuracy par le coefficient R²",
        "Il est correct ; il faut seulement relever le seuil de décision à 0,9 pour détecter plus de fraudes",
      ],
      correctIndex: 1,
      explanation:
        "Sur des classes très déséquilibrées, l'accuracy est dominée par la classe majoritaire. Ce modèle ne détecte aucune fraude, ce que révèlent le rappel et la courbe précision-rappel.",
      difficulty: "medium",
    },
  ],
  "/tech-mastry/data-science/deep-learning": [
    {
      id: "data-science-deep-learning-1",
      question:
        "À quoi sert nn.Dropout(0.3) dans un réseau, et que devient-il à l'inférence ?",
      options: [
        "Il retire 30 % des données d'entraînement, et fait de même à l'inférence",
        "Il réduit le learning rate de 30 %, et reste actif à l'inférence",
        "Il compresse le modèle de 30 % ; les mêmes neurones restent coupés ensuite ; model.eval() ne change rien",
        "Il coupe 30 % des neurones au hasard pour régulariser ; model.eval() le désactive",
      ],
      correctIndex: 3,
      explanation:
        "Dropout est une régularisation qui n'agit que pendant l'entraînement. En mode eval, tous les neurones sont utilisés, c'est pourquoi la boucle appelle model.train() puis model.eval().",
      difficulty: "easy",
    },
    {
      id: "data-science-deep-learning-2",
      question:
        "Pourquoi ReLU est-elle généralement préférée à sigmoid dans les couches cachées d'un réseau profond ?",
      options: [
        "Ses sorties sont bornées entre 0 et 1 et s'interprètent comme des probabilités",
        "Son gradient vaut 1 pour x > 0, ce qui limite l'évanouissement du gradient",
        "Elle est dérivable en tout point, contrairement à sigmoid, ce qui simplifie le calcul",
        "Elle centre les sorties autour de zéro, ce qui supprime le besoin de normalisation",
      ],
      correctIndex: 1,
      explanation:
        "Sigmoid sature pour les grandes valeurs, son gradient devient quasi nul et ralentit l'apprentissage des premières couches. ReLU n'est d'ailleurs pas dérivable en 0 et ne centre pas ses sorties.",
      difficulty: "easy",
    },
    {
      id: "data-science-deep-learning-3",
      question:
        "La loss d'entraînement continue de baisser, mais la loss de validation remonte à partir de l'époque 12. Quelle est la meilleure réaction ?",
      options: [
        "Poursuivre l'entraînement : la validation finira par rejoindre le train",
        "Agrandir le réseau, car le modèle est clairement en sous-apprentissage",
        "S'arrêter vers l'époque 12 (early stopping), restaurer les meilleurs poids, régulariser",
        "Augmenter le learning rate pour faire baisser la loss d'entraînement plus vite et ainsi combler l'écart",
      ],
      correctIndex: 2,
      explanation:
        "Une validation qui se dégrade pendant que le train s'améliore signe le surapprentissage. L'early stopping, le dropout, la data augmentation ou une taille de modèle réduite sont les bons leviers.",
      difficulty: "medium",
    },
    {
      id: "data-science-deep-learning-4",
      question:
        "Vous disposez de 2 000 radiographies annotées pour une tâche de classification. Quelle approche est la plus raisonnable ?",
      options: [
        "Entraîner un grand CNN depuis zéro, car les poids aléatoires évitent les biais et le régulariser avec un dropout élevé",
        "Entraîner un Transformer from scratch, car l'architecture est plus récente",
        "Dupliquer chaque image dix fois pour atteindre 20 000 exemples",
        "Partir d'un CNN pré-entraîné, affiner les dernières couches, ajouter de la data augmentation",
      ],
      correctIndex: 3,
      explanation:
        "Le transfer learning réutilise des représentations apprises sur beaucoup de données et demande peu d'exemples. Dupliquer les images n'apporte aucune information nouvelle et favorise le surapprentissage.",
      difficulty: "medium",
    },
    {
      id: "data-science-deep-learning-5",
      question:
        "Que provoque cette boucle d'entraînement PyTorch ?\n\nfor X, y in loader:\n    loss = criterion(model(X), y)\n    loss.backward()\n    optimizer.step()",
      options: [
        "Les gradients s'accumulent d'un batch à l'autre, ce qui rend les mises à jour incohérentes",
        "Rien d'anormal : backward() réinitialise les gradients avant de les calculer et le code produit donc des résultats corrects",
        "optimizer.step() remet lui-même les gradients à zéro après la mise à jour",
        "Le modèle n'apprend pas du tout, car backward() ne calcule rien sans zero_grad()",
      ],
      correctIndex: 0,
      explanation:
        "PyTorch additionne les gradients dans .grad à chaque backward() : sans optimizer.zero_grad(), chaque pas utilise la somme des gradients de tous les batchs précédents. backward() calcule bien les gradients, mais step() ne les remet pas à zéro.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/data-science/data-engineering": [
    {
      id: "data-science-data-engineering-1",
      question:
        "Dans une architecture médaillon, à quelle couche déduplique-t-on et valide-t-on les données ingérées ?",
      options: [
        "En Silver : Bronze conserve le brut, Silver nettoie, valide et dédoublonne",
        "En Bronze, pour ne jamais stocker de doublons et gagner de la place dès l'ingestion",
        "En Gold, car seules les agrégations métier doivent être propres",
        "Dans l'outil de BI, au moment de la lecture des tableaux de bord",
      ],
      correctIndex: 0,
      explanation:
        "Bronze garde les données telles qu'elles arrivent pour pouvoir rejouer les traitements. Le nettoyage appartient à Silver, et Gold ne fait que préparer des agrégats pour l'analyse.",
      difficulty: "easy",
    },
    {
      id: "data-science-data-engineering-2",
      question:
        "Une table d'événements Parquet est partitionnée par date. Quel est l'avantage pour une requête avec WHERE date = '2025-03-01' ?",
      options: [
        "Chaque partition est chiffrée séparément, ce qui rend la requête plus sûre",
        "Les doublons de chaque partition sont supprimés automatiquement",
        "Seule la partition du jour est lue, au lieu de la table entière",
        "La requête devient transactionnelle (ACID) sans configuration supplémentaire",
      ],
      correctIndex: 2,
      explanation:
        "Le partition pruning évite de lire les partitions qui ne correspondent pas au filtre. Le partitionnement n'apporte ni déduplication ni garanties ACID : ces dernières demandent un format de table comme Iceberg.",
      difficulty: "easy",
    },
    {
      id: "data-science-data-engineering-3",
      question:
        "Un DAG Airflow quotidien charge le DWH en mode append. Après un échec puis un rejeu de la tâche load, les chiffres du jour sont doublés. Quelle correction ?",
      options: [
        "Augmenter retries à 5 pour que la tâche réussisse dès le premier essai et éviter ainsi tout doublon lors des rejeux",
        "Désactiver les rejeux pour ne jamais exécuter deux fois une tâche",
        "Dédoublonner à la main avec un DELETE chaque lundi matin",
        "Rendre le chargement idempotent : écraser la partition du jour ou faire un MERGE sur la clé",
      ],
      correctIndex: 3,
      explanation:
        "Un pipeline doit pouvoir être rejoué sans effet de bord, car les rejeux et backfills sont inévitables. Plus de retries aggraverait même les doublons.",
      difficulty: "medium",
    },
    {
      id: "data-science-data-engineering-4",
      question:
        "Que renvoie cette requête ?\n\nSELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY dept ORDER BY salary DESC) AS rn\n  FROM employees) t\nWHERE rn = 1",
      options: [
        "Une ligne complète par département : l'employé le mieux payé",
        "Une seule ligne : le salaire maximum de toute l'entreprise",
        "Une ligne par département avec la somme de ses salaires",
        "Tous les employés, triés par salaire décroissant dans chaque département",
      ],
      correctIndex: 0,
      explanation:
        "ROW_NUMBER numérote les lignes de chaque département par salaire décroissant, et le filtre rn = 1 garde la première. Un GROUP BY avec MAX ne permettrait pas de conserver les autres colonnes de la ligne.",
      difficulty: "medium",
    },
    {
      id: "data-science-data-engineering-5",
      question:
        "Le DAG est vert depuis trois jours, mais la table clients ne reçoit plus aucune ligne : la source n'a rien livré. Quel contrôle aurait déclenché une alerte ?",
      options: [
        "Un test d'unicité sur la clé primaire de la table",
        "Une vérification de fraîcheur : MAX(updated_at) comparé au SLA attendu",
        "Un test de validité sur le format des adresses e-mail",
        "Un test de cohérence entre deux tables du data warehouse pour détecter une divergence de chiffres",
      ],
      correctIndex: 1,
      explanation:
        "Un pipeline peut réussir techniquement tout en traitant zéro ligne ; seul un contrôle de fraîcheur (ou de volume) détecte ce silence. Unicité, validité et cohérence portent sur le contenu des lignes présentes.",
      difficulty: "hard",
    },
  ],
  "/tech-mastry/data-science/mlops": [
    {
      id: "data-science-mlops-1",
      question:
        "En été, l'âge moyen des clients envoyés au modèle change, mais la relation entre âge et achat reste la même. De quoi s'agit-il ?",
      options: [
        "D'un concept drift : la relation entrées-cible a changé",
        "D'un data drift : la distribution des entrées a changé",
        "D'une fuite de données entre entraînement et production",
        "D'une dérive de latence du service de prédiction",
      ],
      correctIndex: 1,
      explanation:
        "Quand seule la distribution des features évolue, c'est un data drift (mesurable avec PSI ou KL-divergence). Le concept drift suppose que la relation avec la cible ait elle-même changé.",
      difficulty: "easy",
    },
    {
      id: "data-science-mlops-2",
      question:
        "Pourquoi déployer fraud-detector-v4 en canary à 10 % du trafic plutôt qu'à 100 % d'un coup ?",
      options: [
        "Pour que le modèle s'entraîne sur les 10 % de requêtes réelles avant le déploiement complet",
        "Pour réduire définitivement de 90 % le coût d'inférence",
        "Parce que le modèle fonctionne mieux avec moins de trafic",
        "Pour limiter l'impact d'un mauvais modèle et comparer en réel avant la promotion",
      ],
      correctIndex: 3,
      explanation:
        "Le canary expose une petite part des utilisateurs à la nouvelle version, ce qui borne les dégâts et permet de comparer les métriques avec l'ancienne. Il ne sert ni à entraîner ni à baisser les coûts.",
      difficulty: "easy",
    },
    {
      id: "data-science-mlops-3",
      question:
        "La précision en production a chuté, mais le PSI de toutes les features d'entrée reste stable. Quelle hypothèse est la plus probable ?",
      options: [
        "Un concept drift : la relation features-cible a évolué, à confirmer avec les labels récents",
        "Un data drift sévère, car un PSI stable prouve que les entrées ont changé et il faut alors ré-entraîner immédiatement",
        "Un problème de débit : trop de requêtes par seconde dégradent la précision",
        "Un surapprentissage apparu après le déploiement, sans lien avec les données",
      ],
      correctIndex: 0,
      explanation:
        "Un PSI stable exclut un changement des distributions d'entrée, d'où l'idée d'un concept drift. Le débit influence la latence et les erreurs 5xx, pas la qualité des prédictions.",
      difficulty: "medium",
    },
    {
      id: "data-science-mlops-4",
      question:
        "Pour reproduire exactement un modèle entraîné il y a six mois, que faut-il avoir versionné ?",
      options: [
        "Le hash Git du code d'entraînement, qui suffit à tout régénérer",
        "Le code, les données, les hyperparamètres et l'environnement d'exécution",
        "Uniquement le fichier .joblib du modèle conservé dans le registry avec ses métriques de test",
        "Les métriques finales, qui permettent de retrouver les paramètres",
      ],
      correctIndex: 1,
      explanation:
        "Le même code sur d'autres données, d'autres versions de bibliothèques ou d'autres hyperparamètres donne un autre modèle. Le fichier du modèle ne permet que de le réutiliser, pas de le reproduire.",
      difficulty: "medium",
    },
    {
      id: "data-science-mlops-5",
      question:
        "Le candidat v4 a une AUC hors ligne supérieure de 0,5 point à celle de v3, le modèle actuellement en production. Quelle promotion respecte les bonnes pratiques MLOps ?",
      options: [
        "Remplacer v3 immédiatement : la métrique hors ligne fait foi et libérer l'ancienne infrastructure",
        "Réentraîner v4 sur le jeu de test pour consolider ce gain",
        "Passer par un canary ou un shadow, comparer les métriques en ligne, garder un rollback",
        "Attendre qu'un drift soit détecté sur v3 avant d'envisager v4",
      ],
      correctIndex: 2,
      explanation:
        "Un petit gain hors ligne peut disparaître en conditions réelles (décalage de données, latence, métriques métier). Entraîner sur le jeu de test détruirait toute mesure fiable.",
      difficulty: "hard",
    },
  ],
};
