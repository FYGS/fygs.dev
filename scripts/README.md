# 📸 Scripts Utilitaires

Ce dossier contient les scripts utilitaires pour le projet FYGS.dev.

## 🎨 Generate Preview (`generate-preview.js`)

Script permettant de générer des captures d'écran haute qualité de n'importe quelle page du site. Idéal pour créer des aperçus pour les réseaux sociaux, la documentation ou les présentations.

### 📋 Prérequis

- Node.js installé
- Projet en cours d'exécution (`pnpm dev`)
- Puppeteer (installé via les dépendances du projet)

### 🚀 Utilisation

```bash
node scripts/generate-preview.js [options]
```

### ⚙️ Options

| Option | Description | Défaut |
|--------|-------------|--------|
| `--path` | Chemin de la page à capturer (ex: "/blog") | "/" |
| `--output` | Nom du fichier de sortie | "preview.png" |
| `--width` | Largeur de la capture | 1200 |
| `--height` | Hauteur de la capture | 630 |
| `--scale` | Facteur d'échelle (qualité) | 2 |
| `--full` | Capture la page entière | false |
| `--wait` | Temps d'attente après chargement (ms) | 1000 |
| `--help` | Affiche l'aide | - |

### 🌍 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `BASE_URL` | URL de base du site | "http://localhost:3000" |

### 📝 Exemples

1. **Capture de la page d'accueil**
   ```bash
   node scripts/generate-preview.js
   ```

2. **Capture de la page blog**
   ```bash
   node scripts/generate-preview.js --path /blog --output blog-preview.png
   ```

3. **Capture complète de la page projets**
   ```bash
   node scripts/generate-preview.js --path /projects --full --output project-preview.png
   ```

4. **Dimensions personnalisées**
   ```bash
   node scripts/generate-preview.js --width 1600 --height 900 --output large-preview.png
   ```

### 📤 Sortie

Les images générées sont sauvegardées dans le dossier `public/images/` du projet.

### 🎯 Cas d'Utilisation

- Génération d'aperçus pour les réseaux sociaux (Open Graph, Twitter Cards)
- Création de captures d'écran pour la documentation
- Tests visuels rapides de différentes pages
- Création de vignettes pour le portfolio

### 🔍 Spécifications Techniques

- Format de sortie : PNG (par défaut) ou autre selon l'extension du fichier de sortie
- Qualité : Retina (2x) par défaut, configurable via `--scale`
- Dimensions optimales pour réseaux sociaux : 1200x630px (par défaut)
- Temps d'attente : 1000ms par défaut pour assurer le chargement du contenu dynamique

### ⚠️ Notes

1. Assurez-vous que le serveur de développement est en cours d'exécution avant d'utiliser le script
2. Pour les pages avec contenu dynamique, ajustez le temps d'attente avec `--wait`
3. Les dimensions par défaut sont optimisées pour les aperçus sur les réseaux sociaux
4. Le mode `--full` capture la page entière, utile pour les longues pages

### 🐛 Dépannage

Si vous rencontrez des erreurs :
1. Vérifiez que le serveur de développement est en cours d'exécution
2. Assurez-vous que le chemin spécifié est correct
3. Augmentez le temps d'attente pour les pages avec beaucoup de contenu dynamique
4. Vérifiez les logs pour plus de détails sur l'erreur
