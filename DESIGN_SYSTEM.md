# Design System — fygs.dev

## Couleurs

### Palette Primaire (Indigo)

| Token             | Light              | Dark               |
| ----------------- | ------------------ | ------------------ |
| `--primary`       | `239 84% 67%`     | `239 84% 67%`     |
| `--primary-foreground` | `0 0% 100%`  | `0 0% 100%`       |
| `--accent`        | `239 84% 95%`     | `239 30% 18%`     |
| `--muted`         | `220 14% 96%`     | `220 14% 14%`     |

### Couleurs sémantiques

| Token          | Rôle                    |
| -------------- | ----------------------- |
| `--success`    | Validations, succès     |
| `--warning`    | Alertes non critiques   |
| `--info`       | Messages informatifs    |
| `--destructive`| Erreurs, suppressions   |

---

## Typographie

### Fonts

| Variable          | Font          | Usage              |
| ----------------- | ------------- | ------------------ |
| `--font-sans`     | Geist Sans    | Corps de texte     |
| `--font-mono`     | Geist Mono    | Code, données      |
| `--font-display`  | Anek Telugu   | Titres display     |

### Échelle typographique

| Classe           | Taille / Line-height        | Usage                    |
| ---------------- | --------------------------- | ------------------------ |
| `.text-display`  | `clamp(2.5rem,5vw,3.5rem)` / 1.1 | Hero, titres majeurs |
| `.text-heading-1`| `clamp(1.875rem,3vw,2.25rem)` / 1.2 | Titres de section  |
| `.text-heading-2`| `clamp(1.5rem,2.5vw,1.875rem)` / 1.3 | Sous-sections      |
| `.text-heading-3`| `1.25rem` / 1.4             | Titres de carte          |
| `.text-body`     | `1rem` / 1.6                | Texte principal          |
| `.text-body-sm`  | `0.875rem` / 1.5            | Texte secondaire         |
| `.text-caption`  | `0.75rem` / 1.4             | Labels, métadonnées      |

---

## Espacement

| Token           | Valeur   | Usage                  |
| --------------- | -------- | ---------------------- |
| `--spacing-xs`  | `0.25rem`| Gaps internes          |
| `--spacing-sm`  | `0.5rem` | Padding compact        |
| `--spacing-md`  | `1rem`   | Padding standard       |
| `--spacing-lg`  | `1.5rem` | Sections               |
| `--spacing-xl`  | `2rem`   | Séparations            |
| `--spacing-2xl` | `3rem`   | Grandes sections       |
| `--spacing-3xl` | `4rem`   | Hero, landing          |
| `--spacing-4xl` | `6rem`   | Pleine page            |

---

## Motion

### Durées

| Token               | Valeur | Usage                         |
| ------------------- | ------ | ----------------------------- |
| `--duration-fast`   | `100ms`| Micro-interactions            |
| `--duration-normal` | `200ms`| Transitions standard          |
| `--duration-slow`   | `300ms`| Entrées/sorties modales       |
| `--duration-slower` | `500ms`| Animations complexes          |

### Courbes

| Token             | Valeur                       | Usage               |
| ----------------- | ---------------------------- | ------------------- |
| `--ease-out`      | `cubic-bezier(0.16,1,0.3,1)` | Entrées             |
| `--ease-in-out`   | `cubic-bezier(0.76,0,0.24,1)`| Transitions d'état  |
| `--ease-spring`   | `cubic-bezier(0.34,1.56,0.64,1)`| Rebonds, boutons |

### Utilitaires CSS

```css
.transition-theme   /* color background-color border-color, duration-normal, ease-in-out */
.transition-transform /* transform, duration-normal, ease-out */
.transition-opacity  /* opacity, duration-normal, ease-out */
```

---

## Composants des formations

Réutilisés par le catalogue, la page d'une formation, l'accueil et les parcours ; aucun autre composant ne refait
leur travail.

| Composant | Rôle |
|-----------|------|
| `components/courses/course-card-shared.tsx` | Carte d'une formation (catalogue, accueil) : miniature, niveau, durée, prix exact, statut du visiteur |
| `components/paths/path-card.tsx` | Carte d'un parcours |
| `components/marketing/course-thumbnail.tsx` | Miniature d'une formation, avec un fond neutre quand il n'y en a pas |
| `components/marketing/course-trailer.tsx` | Bande-annonce de la page d'une formation |
| `components/marketing/course-faq.tsx` | FAQ d'une formation (accordéon accessible) |
| `components/learning/lesson-content-renderer.tsx` | Seul rendu du contenu des leçons et des diapositives (Markdown ou HTML, nettoyé) |

Libellés et couleurs des niveaux, catégories et accès : `lib/courses/labels.ts` (badges lisibles en clair et en
sombre). Durées : `lib/format-duration.ts`. Prix : `lib/price-format.ts`.

---

## Conventions

1. **Toujours** utiliser les tokens CSS (`var(--spacing-md)`) plutôt que des valeurs arbitraires
2. **Toujours** utiliser les classes typographiques (`text-heading-1`) plutôt que `text-2xl`
3. **Toujours** utiliser les durées de motion (`duration-[var(--duration-normal)]`) plutôt que `duration-200`
4. **Jamais** de CSS-in-JS ou inline styles
5. **Jamais** de `!important`
6. Les composants UI utilisent `cn()` pour la fusion de classes (clsx + tailwind-merge)
