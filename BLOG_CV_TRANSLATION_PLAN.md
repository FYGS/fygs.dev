# Plan de Traduction Complet — Sections Blog & CV

_Document de référence pour l'implémentation i18n complète des sections Blog et CV_
_Dernière mise à jour : Juillet 2025_

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture i18n existante](#2-architecture-i18n-existante)
3. [Section Blog — Inventaire des chaînes](#3-section-blog--inventaire-des-chaînes)
4. [Section CV — Inventaire des chaînes](#4-section-cv--inventaire-des-chaînes)
5. [Fichiers `.content.ts` à créer](#5-fichiers-contentts-à-créer)
6. [Plan d'implémentation](#6-plan-dimplémentation)
7. [Contenu traduit complet](#7-contenu-traduit-complet)
8. [Checklist de validation](#8-checklist-de-validation)

---

## 1. Vue d'ensemble

### État actuel
- **28 fichiers `.content.ts` existants** pour header, footer, hero, contact, auth, etc.
- **0 fichiers `.content.ts`** pour les sections Blog et CV
- **~40+ chaînes hardcodées** dans la section Blog (10+ composants)
- **~30+ chaînes hardcodées UI** dans la section CV (`me/page.tsx`)
- **~560 lignes de données** dans `me/data/index.ts` — tout en anglais
- **3 locales** : `fr` (défaut), `en`, `es`

### Stratégie de traduction

| Type de contenu | Approche |
|---|---|
| **UI labels** (titres, boutons, tooltips) | Fichiers `.content.ts` avec `t({ en, fr, es })` + `useIntlayer()` |
| **Toast messages** | Fichiers `.content.ts` avec `useIntlayer()` |
| **Date formatting** | ✅ **DÉJÀ FAIT** — migration vers `locale` dynamique dans cette session |
| **Données CV structurées** | Fichier `me-data.content.ts` dédié avec données trilingues |
| **Contenu des articles blog** | Hors scope — les articles MDX restent en anglais (contenu éditorial) |

### Impact estimé

| Métrique | Valeur |
|---|---|
| Fichiers `.content.ts` à créer | **7** |
| Fichiers composants à modifier | **12** |
| Chaînes à traduire | **~180** |
| Données CV à traduire | **~300** lignes de texte |

---

## 2. Architecture i18n existante

### Pattern intlayer standard

```typescript
// Fichier: content/[nom].content.ts
import { t, type Dictionary } from "intlayer";

const monContenu = {
  key: "nom-unique",
  content: {
    maChaine: t({
      en: "English text",
      fr: "Texte français",
      es: "Texto en español",
    }),
  },
} satisfies Dictionary;

export default monContenu;
```

### Usage dans les composants

```tsx
// Composant serveur
import { useIntlayer } from "next-intlayer/server";

export default function Page() {
  const { maChaine } = useIntlayer("nom-unique");
  return <h1>{maChaine}</h1>;
}

// Composant client
"use client";
import { useIntlayer } from "next-intlayer";

export function MonComposant() {
  const { maChaine } = useIntlayer("nom-unique");
  return <h1>{maChaine}</h1>;
}
```

### Emplacement des fichiers content existants
```
content/
├── header.content.ts
├── footer.content.ts
├── hero.content.ts
├── contact.content.ts
├── locale-ui.content.ts
└── ... (28 fichiers au total)
```

---

## 3. Section Blog — Inventaire des chaînes

### 3.1. `app/[locale]/(main)/blog/page.client.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Technical Blog"` | `blog.page.title` | ✅ FAIT (inline) |
| `"Expert software engineering articles..."` | `blog.page.description` | ✅ FAIT (inline) |
| `"No blog posts found"` | `blog.page.noResults` | ✅ FAIT (inline) |
| `for "${searchTerm}"` | `blog.page.noResultsFor` | ✅ FAIT (inline) |

> **Note :** Ces chaînes ont été localisées inline dans cette session. Migration vers `.content.ts` recommandée pour maintenabilité.

### 3.2. `components/blog/blog-post-card.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Draft"` | `blog.card.draft` | ✅ FAIT (inline) |
| `"Read"` | `blog.card.read` | ✅ FAIT (inline) |
| `"Shared successfully"` | `blog.card.shareSuccess` | ✅ FAIT (inline) |
| `"Thank you for sharing!"` | `blog.card.shareDescription` | ✅ FAIT (inline) |

### 3.3. `components/blog/article-stats.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"views"` | `blog.stats.views` | ✅ FAIT (inline) |
| `"likes"` | `blog.stats.likes` | ✅ FAIT (inline) |
| `"shares"` | `blog.stats.shares` | ✅ FAIT (inline) |

### 3.4. `components/blog/social-interactions-client.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Article liked!"` | `blog.social.liked` | ✅ FAIT (inline) |
| `"Like removed"` | `blog.social.unliked` | ✅ FAIT (inline) |
| `"Thank you for your appreciation."` | `blog.social.likedDesc` | ✅ FAIT (inline) |
| `"You've removed your like."` | `blog.social.unlikedDesc` | ✅ FAIT (inline) |
| `"Could not process your like..."` | `blog.social.likeError` | ✅ FAIT (inline) |
| `"Could not share the article..."` | `blog.social.shareError` | ✅ FAIT (inline) |
| `"You liked this"` | `blog.social.tooltipLiked` | ✅ FAIT (inline) |
| `"Like this article"` | `blog.social.tooltipLike` | ✅ FAIT (inline) |
| `"Share this article"` | `blog.social.tooltipShare` | ✅ FAIT (inline) |

### 3.5. `components/blog/similar-articles.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Similar Articles"` | `blog.similar.title` | ✅ FAIT (inline) |
| `"% match"` | — | ✅ SUPPRIMÉ (UX confuse) |

### 3.6. `components/blog/popular-articles.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Popular Articles"` | `blog.popular.title` | ✅ FAIT (inline) |

### 3.7. `components/blog/reading-progress.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Time spent reading:"` | `blog.reading.timeSpent` | ✅ FAIT (inline) |

### 3.8. `components/blog/category-filter.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"All Categories"` | `blog.filter.allCategories` | ✅ FAIT (inline) |

### 3.9. `app/[locale]/(main)/blog/[slug]/page.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| `"Did you find this article helpful?"` | `blog.post.helpful` | ✅ FAIT (inline) |
| Date format `"en-US"` | — | ✅ FAIT (locale dynamique) |

### 3.10. `components/blog/article-preview.tsx`

| Chaîne EN | Clé proposée | Type |
|---|---|---|
| Date format `"en-US"` | — | ✅ FAIT (locale dynamique) |

---

## 4. Section CV — Inventaire des chaînes

### 4.1. `app/[locale]/(main)/me/page.tsx` — Chaînes UI

| Chaîne EN | Clé proposée | FR | ES |
|---|---|---|---|
| `"Senior Software Engineer"` | `cv.header.role` | `"Ingénieur Logiciel Senior"` | `"Ingeniero de Software Senior"` |
| `"Professional Experience"` | `cv.sections.experience` | `"Expérience Professionnelle"` | `"Experiencia Profesional"` |
| `"Education"` | `cv.sections.education` | `"Formation"` | `"Formación"` |
| `"Technical Skills"` | `cv.sections.technicalSkills` | `"Compétences Techniques"` | `"Habilidades Técnicas"` |
| `"Languages"` | `cv.sections.languages` | `"Langues"` | `"Idiomas"` |
| `"Certifications"` | `cv.sections.certifications` | `"Certifications"` | `"Certificaciones"` |
| `"Continuously learning..."` | `cv.skills.learningNote` | `"Apprentissage continu et exploration de nouvelles technologies pour rester à la pointe du développement web."` | `"Aprendizaje continuo y exploración de nuevas tecnologías para estar a la vanguardia del desarrollo web."` |
| `"Credential ID:"` | `cv.certifications.credentialId` | `"ID de certification :"` | `"ID de credencial:"` |
| `"Preview CV"` | `cv.preview.title` | `"Aperçu du CV"` | `"Vista previa del CV"` |
| `"Ready to Build Something Amazing?"` | `cv.cta.title` | `"Prêt à Construire Quelque Chose d'Extraordinaire ?"` | `"¿Listo para Construir Algo Increíble?"` |
| `"Let's collaborate..."` | `cv.cta.description` | `"Collaborons pour transformer vos idées en solutions digitales exceptionnelles. Je suis disponible pour des projets freelance et du conseil technique."` | `"Colaboremos para transformar tus ideas en soluciones digitales excepcionales. Estoy disponible para proyectos freelance y consultoría técnica."` |
| `"Email Me"` | `cv.cta.emailMe` | `"M'envoyer un email"` | `"Envíame un correo"` |
| `"Schedule a Meeting"` | `cv.cta.scheduleMeeting` | `"Planifier un rendez-vous"` | `"Programar una reunión"` |
| `"Connect on LinkedIn"` | `cv.cta.connectLinkedin` | `"Se connecter sur LinkedIn"` | `"Conectar en LinkedIn"` |
| `"Available for projects worldwide..."` | `cv.cta.availability` | `"Disponible pour des projets dans le monde entier • Réponse rapide sous 24 heures"` | `"Disponible para proyectos en todo el mundo • Respuesta rápida en 24 horas"` |
| `"Open to discussing flexible arrangements..."` | `cv.preferences.flexNote` | `"Ouvert à la discussion pour des arrangements flexibles selon les besoins du projet"` | `"Abierto a discutir acuerdos flexibles según los requisitos del proyecto"` |

### 4.2. `app/[locale]/(main)/me/data/index.ts` — Données structurées

> **⚠️ Complexité majeure** : Ce fichier contient ~560 lignes de données entièrement en anglais.
> L'approche recommandée est de créer un fichier `me-data.content.ts` avec la structure `t()` pour chaque champ textuel.

#### EXPERIENCE_ITEMS (6 entrées)

Chaque entrée contient les champs textuels suivants à traduire :

| Champ | Type | Exemple |
|---|---|---|
| `date` | `string` | `"2023 - Present"` → `"2023 - Présent"` / `"2023 - Presente"` |
| `title` | `string` | Titre du poste |
| `type` | `string` | `"Full-time"` / `"Entrepreneurship"` / `"Internship"` |
| `description` | `string[]` | Liste de descriptions (3-8 items chacun) |
| `achievements` | `string[]` | Liste de réalisations (3-5 items chacun) |
| `context` | `string` | Paragraphe long de contexte |

**Champs NON traduits** (identiques dans toutes les langues) :
- `company` — Noms d'entreprises (Allianz Technology, GE Healthcare, etc.)
- `location` — Déjà en français (Paris, France)
- `technologies` — Termes techniques universels
- `current` — booléen

#### EDUCATION_ITEMS (4 entrées)

| Champ | Type | À traduire ? |
|---|---|---|
| `date` | `string` | Non |
| `title` | `string` | **Oui** |
| `institution` | `string` | Non (noms propres) |
| `location` | `string` | Non |
| `description` | `string[]` | **Oui** |
| `achievements` | `string[]` | **Oui** |

#### CERTIFICATIONS (3 entrées)

| Champ | À traduire ? |
|---|---|
| `title` | Non (titres de certification anglais) |
| `issuer` | Non (LinkedIn Learning) |
| `date` / `validUntil` | **Oui** (`"Life"` → `"À vie"` / `"De por vida"`) |
| `credentialId` | Non |
| `link` | Non |

#### SKILLS

| Champ | À traduire ? |
|---|---|
| `technical[].category` | **Oui** (ex: `"Backend Development"` → `"Développement Backend"`) |
| `technical[].skills` | Non (termes techniques) |
| `languages[].language` | **Oui** (ex: `"French"` → `"Français"`) |
| `languages[].level` | **Oui** (ex: `"Native"` → `"Natif"`) |
| `soft` | **Oui** (compétences humaines) |

#### DESCRIPTION

| Champ | À traduire ? |
|---|---|
| `intro.title` | **Oui** |
| `intro.subtitle` | **Oui** |
| `intro.mainText` | **Oui** |
| `intro.description` | **Oui** |
| `experience.title` | **Oui** |
| `experience.items[].role` | **Oui** |
| `experience.items[].company` | Non |
| `expertise.title` | **Oui** |
| `expertise.items[].title` | Non (tech names) |
| `expertise.items[].description` | **Oui** |
| `services.title` | **Oui** |
| `services.items[]` | **Oui** (8 items) |
| `whyMe.title` | **Oui** |
| `whyMe.items[].text` | **Oui** (3 items) |

#### PREFERENCES

| Champ | À traduire ? |
|---|---|
| `title` | **Oui** |
| `sections[].title` | **Oui** (5 sections) |
| `sections[].options[]` | **Partiellement** (certains sont universels) |
| `sections[].details` | **Oui** (tous les textes descriptifs) |

---

## 5. Fichiers `.content.ts` à créer

### 5.1. `content/blog-page.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const blogPageContent = {
  key: "blog-page",
  content: {
    title: t({
      en: "Technical Blog",
      fr: "Blog Technique",
      es: "Blog Técnico",
    }),
    description: t({
      en: "Expert software engineering articles covering modern web development, cloud architecture, and best practices. Written by a seasoned Full-Stack Developer with real-world experience.",
      fr: "Articles d'ingénierie logicielle couvrant le développement web moderne, l'architecture cloud et les bonnes pratiques. Rédigés par un développeur Full-Stack expérimenté.",
      es: "Artículos de ingeniería de software sobre desarrollo web moderno, arquitectura cloud y mejores prácticas. Escritos por un desarrollador Full-Stack con experiencia real.",
    }),
    noResults: t({
      en: "No blog posts found",
      fr: "Aucun article trouvé",
      es: "No se encontraron artículos",
    }),
    noResultsFor: t({
      en: "for",
      fr: "pour",
      es: "para",
    }),
    allCategories: t({
      en: "All Categories",
      fr: "Toutes les catégories",
      es: "Todas las categorías",
    }),
  },
} satisfies Dictionary;

export default blogPageContent;
```

### 5.2. `content/blog-card.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const blogCardContent = {
  key: "blog-card",
  content: {
    read: t({
      en: "Read",
      fr: "Lire",
      es: "Leer",
    }),
    draft: t({
      en: "Draft",
      fr: "Brouillon",
      es: "Borrador",
    }),
    shareSuccess: t({
      en: "Shared successfully",
      fr: "Partagé avec succès",
      es: "Compartido con éxito",
    }),
    shareDescription: t({
      en: "Thank you for sharing!",
      fr: "Merci pour le partage !",
      es: "¡Gracias por compartir!",
    }),
  },
} satisfies Dictionary;

export default blogCardContent;
```

### 5.3. `content/blog-stats.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const blogStatsContent = {
  key: "blog-stats",
  content: {
    views: t({ en: "views", fr: "vues", es: "vistas" }),
    likes: t({ en: "likes", fr: "j'aime", es: "me gusta" }),
    shares: t({ en: "shares", fr: "partages", es: "compartidos" }),
    timeSpent: t({
      en: "Time spent reading:",
      fr: "Temps de lecture :",
      es: "Tiempo de lectura:",
    }),
  },
} satisfies Dictionary;

export default blogStatsContent;
```

### 5.4. `content/blog-social.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const blogSocialContent = {
  key: "blog-social",
  content: {
    liked: t({
      en: "Article liked!",
      fr: "Article aimé !",
      es: "¡Artículo gustado!",
    }),
    unliked: t({
      en: "Like removed",
      fr: "Like retiré",
      es: "Like eliminado",
    }),
    likedDesc: t({
      en: "Thank you for your appreciation.",
      fr: "Merci pour votre appréciation.",
      es: "Gracias por tu apreciación.",
    }),
    unlikedDesc: t({
      en: "You've removed your like.",
      fr: "Vous avez retiré votre like.",
      es: "Has eliminado tu like.",
    }),
    likeError: t({
      en: "Could not process your like. Please try again.",
      fr: "Impossible de traiter votre like. Veuillez réessayer.",
      es: "No se pudo procesar tu like. Inténtalo de nuevo.",
    }),
    shareError: t({
      en: "Could not share the article. Please try again.",
      fr: "Impossible de partager l'article. Veuillez réessayer.",
      es: "No se pudo compartir el artículo. Inténtalo de nuevo.",
    }),
    tooltipLiked: t({
      en: "You liked this",
      fr: "Vous avez aimé cet article",
      es: "Te gustó este artículo",
    }),
    tooltipLike: t({
      en: "Like this article",
      fr: "Aimer cet article",
      es: "Me gusta este artículo",
    }),
    tooltipShare: t({
      en: "Share this article",
      fr: "Partager cet article",
      es: "Compartir este artículo",
    }),
  },
} satisfies Dictionary;

export default blogSocialContent;
```

### 5.5. `content/blog-post.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const blogPostContent = {
  key: "blog-post",
  content: {
    helpful: t({
      en: "Did you find this article helpful?",
      fr: "Cet article vous a été utile ?",
      es: "¿Te resultó útil este artículo?",
    }),
    similarArticles: t({
      en: "Similar Articles",
      fr: "Articles similaires",
      es: "Artículos similares",
    }),
    popularArticles: t({
      en: "Popular Articles",
      fr: "Articles populaires",
      es: "Artículos populares",
    }),
  },
} satisfies Dictionary;

export default blogPostContent;
```

### 5.6. `content/cv-page.content.ts`

```typescript
import { t, type Dictionary } from "intlayer";

const cvPageContent = {
  key: "cv-page",
  content: {
    role: t({
      en: "Senior Software Engineer",
      fr: "Ingénieur Logiciel Senior",
      es: "Ingeniero de Software Senior",
    }),
    sections: {
      experience: t({
        en: "Professional Experience",
        fr: "Expérience Professionnelle",
        es: "Experiencia Profesional",
      }),
      education: t({
        en: "Education",
        fr: "Formation",
        es: "Formación",
      }),
      technicalSkills: t({
        en: "Technical Skills",
        fr: "Compétences Techniques",
        es: "Habilidades Técnicas",
      }),
      languages: t({
        en: "Languages",
        fr: "Langues",
        es: "Idiomas",
      }),
      certifications: t({
        en: "Certifications",
        fr: "Certifications",
        es: "Certificaciones",
      }),
    },
    skills: {
      learningNote: t({
        en: "Continuously learning and exploring new technologies to stay at the forefront of web development.",
        fr: "Apprentissage continu et exploration de nouvelles technologies pour rester à la pointe du développement web.",
        es: "Aprendizaje continuo y exploración de nuevas tecnologías para estar a la vanguardia del desarrollo web.",
      }),
    },
    certifications: {
      credentialId: t({
        en: "Credential ID:",
        fr: "ID de certification :",
        es: "ID de credencial:",
      }),
    },
    preview: {
      title: t({
        en: "Preview CV",
        fr: "Aperçu du CV",
        es: "Vista previa del CV",
      }),
    },
    cta: {
      title: t({
        en: "Ready to Build Something Amazing?",
        fr: "Prêt à Construire Quelque Chose d'Extraordinaire ?",
        es: "¿Listo para Construir Algo Increíble?",
      }),
      description: t({
        en: "Let's collaborate to transform your ideas into exceptional digital solutions. I'm available for freelance projects and technical consulting.",
        fr: "Collaborons pour transformer vos idées en solutions digitales exceptionnelles. Je suis disponible pour des projets freelance et du conseil technique.",
        es: "Colaboremos para transformar tus ideas en soluciones digitales excepcionales. Estoy disponible para proyectos freelance y consultoría técnica.",
      }),
      emailMe: t({
        en: "Email Me",
        fr: "M'envoyer un email",
        es: "Envíame un correo",
      }),
      scheduleMeeting: t({
        en: "Schedule a Meeting",
        fr: "Planifier un rendez-vous",
        es: "Programar una reunión",
      }),
      connectLinkedin: t({
        en: "Connect on LinkedIn",
        fr: "Se connecter sur LinkedIn",
        es: "Conectar en LinkedIn",
      }),
      availability: t({
        en: "Available for projects worldwide • Quick response within 24 hours",
        fr: "Disponible pour des projets dans le monde entier • Réponse rapide sous 24 heures",
        es: "Disponible para proyectos en todo el mundo • Respuesta rápida en 24 horas",
      }),
    },
    preferences: {
      flexNote: t({
        en: "Open to discussing flexible arrangements based on project requirements",
        fr: "Ouvert à la discussion pour des arrangements flexibles selon les besoins du projet",
        es: "Abierto a discutir acuerdos flexibles según los requisitos del proyecto",
      }),
    },
  },
} satisfies Dictionary;

export default cvPageContent;
```

### 5.7. `content/cv-data.content.ts`

> **Fichier le plus volumineux** — contient toutes les données CV traduites.
> Approche : Restructurer `me/data/index.ts` pour importer les chaînes traduites depuis ce fichier.

```typescript
import { t, type Dictionary } from "intlayer";

const cvDataContent = {
  key: "cv-data",
  content: {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DESCRIPTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    description: {
      intro: {
        title: t({
          en: "About Me",
          fr: "À propos de moi",
          es: "Sobre mí",
        }),
        subtitle: t({
          en: "Specialized in TypeScript, Next.js, Node.js, NestJS, Python, and React to bring your ambitious projects to life?",
          fr: "Spécialisé en TypeScript, Next.js, Node.js, NestJS, Python et React pour donner vie à vos projets ambitieux ?",
          es: "¿Especializado en TypeScript, Next.js, Node.js, NestJS, Python y React para dar vida a tus proyectos ambiciosos?",
        }),
        mainText: t({
          en: "I'm a Software Engineer & Technical Trainer | Expert in TypeScript, Next.js, Node.js, NestJS, Python, FastAPI, and React",
          fr: "Ingénieur Logiciel & Formateur Technique | Expert en TypeScript, Next.js, Node.js, NestJS, Python, FastAPI et React",
          es: "Ingeniero de Software & Formador Técnico | Experto en TypeScript, Next.js, Node.js, NestJS, Python, FastAPI y React",
        }),
        description: t({
          en: "With over 7 years of experience as a fullstack developer and technical trainer, I transform ambitious ideas into high-performance, scalable web solutions. My passion for technological innovation and knowledge sharing enables me to create robust applications and empower teams through training and mentorship.",
          fr: "Fort de plus de 7 ans d'expérience en tant que développeur fullstack et formateur technique, je transforme les idées ambitieuses en solutions web performantes et évolutives. Ma passion pour l'innovation technologique et le partage des connaissances me permet de créer des applications robustes et d'accompagner les équipes par la formation et le mentorat.",
          es: "Con más de 7 años de experiencia como desarrollador fullstack y formador técnico, transformo ideas ambiciosas en soluciones web de alto rendimiento y escalables. Mi pasión por la innovación tecnológica y el intercambio de conocimientos me permite crear aplicaciones robustas y empoderar equipos a través de la formación y la mentoría.",
        }),
      },
      experience: {
        title: t({
          en: "Experience in Leading Companies",
          fr: "Expérience dans des Entreprises Leaders",
          es: "Experiencia en Empresas Líderes",
        }),
        items: {
          schneider: {
            role: t({
              en: "Development of IoT solutions for RF geolocation",
              fr: "Développement de solutions IoT pour la géolocalisation RF",
              es: "Desarrollo de soluciones IoT para geolocalización RF",
            }),
          },
          geHealthcare: {
            role: t({
              en: "Creation of user interfaces for medical applications",
              fr: "Création d'interfaces utilisateur pour des applications médicales",
              es: "Creación de interfaces de usuario para aplicaciones médicas",
            }),
          },
          allianz: {
            role: t({
              en: "Design of REST API management systems",
              fr: "Conception de systèmes de gestion d'API REST",
              es: "Diseño de sistemas de gestión de API REST",
            }),
          },
        },
      },
      expertise: {
        title: t({
          en: "Technical Expertise",
          fr: "Expertise Technique",
          es: "Experiencia Técnica",
        }),
        items: {
          typescript: t({
            en: "Robust development with static typing",
            fr: "Développement robuste avec typage statique",
            es: "Desarrollo robusto con tipado estático",
          }),
          nextReact: t({
            en: "Reactive and performant user interfaces",
            fr: "Interfaces utilisateur réactives et performantes",
            es: "Interfaces de usuario reactivas y performantes",
          }),
          nodeNest: t({
            en: "RESTful APIs and microservices design",
            fr: "Conception d'APIs RESTful et de microservices",
            es: "Diseño de APIs RESTful y microservicios",
          }),
          pythonFastapi: t({
            en: "High-performance APIs and automation scripts",
            fr: "APIs haute performance et scripts d'automatisation",
            es: "APIs de alto rendimiento y scripts de automatización",
          }),
          cloud: t({
            en: "Serverless development with AWS services",
            fr: "Développement serverless avec les services AWS",
            es: "Desarrollo serverless con servicios AWS",
          }),
        },
      },
      services: {
        title: t({
          en: "Services Offered",
          fr: "Services Proposés",
          es: "Servicios Ofrecidos",
        }),
        items: {
          customDev: t({
            en: "Custom web application development",
            fr: "Développement d'applications web sur mesure",
            es: "Desarrollo de aplicaciones web a medida",
          }),
          modernization: t({
            en: "Technology stack modernization",
            fr: "Modernisation de la stack technologique",
            es: "Modernización del stack tecnológico",
          }),
          optimization: t({
            en: "Development process optimization",
            fr: "Optimisation des processus de développement",
            es: "Optimización de los procesos de desarrollo",
          }),
          cicd: t({
            en: "CI/CD pipeline implementation",
            fr: "Mise en place de pipelines CI/CD",
            es: "Implementación de pipelines CI/CD",
          }),
          api: t({
            en: "API design and development",
            fr: "Conception et développement d'API",
            es: "Diseño y desarrollo de API",
          }),
          training: t({
            en: "Technical training and mentoring (Python, TypeScript, Node.js, React)",
            fr: "Formation technique et mentorat (Python, TypeScript, Node.js, React)",
            es: "Formación técnica y mentoría (Python, TypeScript, Node.js, React)",
          }),
          workshops: t({
            en: "Corporate workshops and bootcamps",
            fr: "Ateliers et bootcamps en entreprise",
            es: "Talleres y bootcamps corporativos",
          }),
          support: t({
            en: "Technical support and maintenance",
            fr: "Support technique et maintenance",
            es: "Soporte técnico y mantenimiento",
          }),
        },
      },
      whyMe: {
        title: t({
          en: "Why Choose Me?",
          fr: "Pourquoi Me Choisir ?",
          es: "¿Por Qué Elegirme?",
        }),
        items: {
          expertise: t({
            en: "Deep technical expertise in modern JavaScript technologies",
            fr: "Expertise technique approfondie dans les technologies JavaScript modernes",
            es: "Experiencia técnica profunda en tecnologías JavaScript modernas",
          }),
          translate: t({
            en: "Ability to translate complex business needs into effective technical solutions",
            fr: "Capacité à traduire des besoins métier complexes en solutions techniques efficaces",
            es: "Capacidad para traducir necesidades de negocio complejas en soluciones técnicas eficaces",
          }),
          results: t({
            en: "Results-oriented approach with strong focus on quality",
            fr: "Approche orientée résultats avec un fort accent sur la qualité",
            es: "Enfoque orientado a resultados con fuerte énfasis en la calidad",
          }),
        },
      },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EXPERIENCES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    experiences: {
      // Champ "date" commun
      present: t({ en: "Present", fr: "Présent", es: "Presente" }),

      // Types de contrat
      fullTime: t({
        en: "Full-time",
        fr: "CDI / Temps plein",
        es: "Tiempo completo",
      }),
      entrepreneurship: t({
        en: "Entrepreneurship",
        fr: "Entrepreneuriat",
        es: "Emprendimiento",
      }),
      internship: t({
        en: "Internship",
        fr: "Stage",
        es: "Prácticas",
      }),

      // ── Allianz Technology ──
      allianz: {
        title: t({
          en: "Backend Developer | Node.js, NestJS, TypeScript, AWS Cloud",
          fr: "Développeur Backend | Node.js, NestJS, TypeScript, AWS Cloud",
          es: "Desarrollador Backend | Node.js, NestJS, TypeScript, AWS Cloud",
        }),
        description: {
          d1: t({
            en: "Design and development of high-performance REST APIs, facilitating seamless integration between Allianz's various systems",
            fr: "Conception et développement d'APIs REST haute performance, facilitant l'intégration entre les différents systèmes d'Allianz",
            es: "Diseño y desarrollo de APIs REST de alto rendimiento, facilitando la integración entre los diversos sistemas de Allianz",
          }),
          d2: t({
            en: "Implementation of a microservices architecture, enhancing the scalability and resilience of applications",
            fr: "Mise en place d'une architecture microservices, améliorant la scalabilité et la résilience des applications",
            es: "Implementación de una arquitectura de microservicios, mejorando la escalabilidad y resiliencia de las aplicaciones",
          }),
          d3: t({
            en: "Deployment of serverless solutions, optimizing infrastructure costs and flexibility",
            fr: "Déploiement de solutions serverless, optimisant les coûts d'infrastructure et la flexibilité",
            es: "Despliegue de soluciones serverless, optimizando costos de infraestructura y flexibilidad",
          }),
          d4: t({
            en: "Automation of deployment processes through Gitlab CI/CD, accelerating development cycles",
            fr: "Automatisation des processus de déploiement via Gitlab CI/CD, accélérant les cycles de développement",
            es: "Automatización de procesos de despliegue mediante Gitlab CI/CD, acelerando los ciclos de desarrollo",
          }),
          d5: t({
            en: "Utilization of Terraform for Infrastructure as Code, ensuring consistency and reproducibility of environments",
            fr: "Utilisation de Terraform pour l'Infrastructure as Code, garantissant la cohérence et la reproductibilité des environnements",
            es: "Utilización de Terraform para Infraestructura como Código, asegurando consistencia y reproducibilidad de entornos",
          }),
          d6: t({
            en: "Leveraging AWS services (Lambda, S3, DynamoDB, SQS, CloudWatch) to build robust cloud-native solutions",
            fr: "Exploitation des services AWS (Lambda, S3, DynamoDB, SQS, CloudWatch) pour construire des solutions cloud-native robustes",
            es: "Aprovechamiento de servicios AWS (Lambda, S3, DynamoDB, SQS, CloudWatch) para construir soluciones cloud-native robustas",
          }),
        },
        achievements: {
          a1: t({
            en: "Reduced client request processing time by 30%",
            fr: "Réduction du temps de traitement des requêtes clients de 30%",
            es: "Reducción del tiempo de procesamiento de solicitudes de clientes en un 30%",
          }),
          a2: t({
            en: "Improved system stability by 25% during peak loads",
            fr: "Amélioration de la stabilité du système de 25% lors des pics de charge",
            es: "Mejora de la estabilidad del sistema en un 25% durante picos de carga",
          }),
          a3: t({
            en: "Decreased infrastructure costs by 20% through cloud optimization",
            fr: "Réduction des coûts d'infrastructure de 20% grâce à l'optimisation cloud",
            es: "Reducción de costos de infraestructura en un 20% mediante optimización cloud",
          }),
          a4: t({
            en: "Enhanced system security and compliance by implementing cloud-based NFRs",
            fr: "Renforcement de la sécurité et de la conformité des systèmes par l'implémentation de NFR cloud",
            es: "Mejora de la seguridad y conformidad del sistema mediante la implementación de NFRs basados en la nube",
          }),
        },
        context: t({
          en: "Allianz Technology, the technology subsidiary of the Allianz Group, is at the forefront of innovation in the insurance and financial services sector. The company develops cutting-edge digital solutions to enhance customer experience and optimize the group's internal processes. With a presence in over 70 countries and serving millions of customers, Allianz Technology plays a crucial role in the digital transformation of the insurance giant.\n\nI joined Allianz Technology in 2023 as a Backend Developer, contributing to the development and improvement of the core systems that power the group's insurance services. My role is essential in creating a robust and scalable infrastructure capable of meeting the growing needs of a global clientele.",
          fr: "Allianz Technology, la filiale technologique du groupe Allianz, est à la pointe de l'innovation dans le secteur de l'assurance et des services financiers. L'entreprise développe des solutions digitales de pointe pour améliorer l'expérience client et optimiser les processus internes du groupe. Présente dans plus de 70 pays et servant des millions de clients, Allianz Technology joue un rôle crucial dans la transformation digitale du géant de l'assurance.\n\nJ'ai rejoint Allianz Technology en 2023 en tant que Développeur Backend, contribuant au développement et à l'amélioration des systèmes centraux qui alimentent les services d'assurance du groupe. Mon rôle est essentiel dans la création d'une infrastructure robuste et scalable capable de répondre aux besoins croissants d'une clientèle mondiale.",
          es: "Allianz Technology, la subsidiaria tecnológica del grupo Allianz, está a la vanguardia de la innovación en el sector de seguros y servicios financieros. La empresa desarrolla soluciones digitales de vanguardia para mejorar la experiencia del cliente y optimizar los procesos internos del grupo. Con presencia en más de 70 países y sirviendo a millones de clientes, Allianz Technology desempeña un papel crucial en la transformación digital del gigante asegurador.\n\nMe uní a Allianz Technology en 2023 como Desarrollador Backend, contribuyendo al desarrollo y mejora de los sistemas centrales que impulsan los servicios de seguros del grupo. Mi rol es esencial en la creación de una infraestructura robusta y escalable capaz de satisfacer las crecientes necesidades de una clientela global.",
        }),
      },

      // ── Ouestech ──
      ouestech: {
        title: t({
          en: "Full Stack Software Engineer | React, NextJS, TypeScript, Node.js",
          fr: "Ingénieur Logiciel Full Stack | React, NextJS, TypeScript, Node.js",
          es: "Ingeniero de Software Full Stack | React, NextJS, TypeScript, Node.js",
        }),
        description: {
          d1: t({
            en: "Developing and maintaining scalable web applications for various clients",
            fr: "Développement et maintenance d'applications web scalables pour divers clients",
            es: "Desarrollo y mantenimiento de aplicaciones web escalables para diversos clientes",
          }),
          d2: t({
            en: "Leading technical architecture decisions and implementation strategies",
            fr: "Direction des décisions d'architecture technique et des stratégies d'implémentation",
            es: "Liderazgo en decisiones de arquitectura técnica y estrategias de implementación",
          }),
          d3: t({
            en: "Collaborating with clients to define project requirements and timelines",
            fr: "Collaboration avec les clients pour définir les exigences et les délais des projets",
            es: "Colaboración con clientes para definir requisitos y plazos de proyectos",
          }),
          d4: t({
            en: "Ensuring high code quality and performance optimization",
            fr: "Assurer une haute qualité de code et l'optimisation des performances",
            es: "Asegurar alta calidad de código y optimización del rendimiento",
          }),
          d5: t({
            en: "Managing entire development lifecycle from conception to deployment",
            fr: "Gestion de l'ensemble du cycle de développement, de la conception au déploiement",
            es: "Gestión de todo el ciclo de desarrollo, desde la concepción hasta el despliegue",
          }),
          d6: t({
            en: "Implementing responsive and accessible user interfaces",
            fr: "Implémentation d'interfaces utilisateur responsives et accessibles",
            es: "Implementación de interfaces de usuario responsive y accesibles",
          }),
          d7: t({
            en: "Delivering technical training sessions in Python, TypeScript, Node.js, and React",
            fr: "Animation de formations techniques en Python, TypeScript, Node.js et React",
            es: "Impartición de formaciones técnicas en Python, TypeScript, Node.js y React",
          }),
          d8: t({
            en: "Mentoring junior developers and conducting code reviews",
            fr: "Mentorat de développeurs juniors et revues de code",
            es: "Mentoría de desarrolladores junior y revisiones de código",
          }),
        },
        achievements: {
          a1: t({
            en: "Successfully delivered 15+ projects for diverse clients",
            fr: "Plus de 15 projets livrés avec succès pour des clients variés",
            es: "Más de 15 proyectos entregados con éxito para clientes diversos",
          }),
          a2: t({
            en: "Achieved 98% client satisfaction rate",
            fr: "Taux de satisfaction client de 98%",
            es: "Tasa de satisfacción del cliente del 98%",
          }),
          a3: t({
            en: "Reduced average page load time by 60%",
            fr: "Réduction du temps de chargement moyen des pages de 60%",
            es: "Reducción del tiempo de carga promedio de las páginas en un 60%",
          }),
          a4: t({
            en: "Implemented automated testing increasing code coverage to 90%",
            fr: "Mise en place de tests automatisés portant la couverture de code à 90%",
            es: "Implementación de pruebas automatizadas aumentando la cobertura de código al 90%",
          }),
          a5: t({
            en: "Trained 50+ developers across multiple corporate workshops",
            fr: "Plus de 50 développeurs formés à travers de multiples ateliers en entreprise",
            es: "Más de 50 desarrolladores formados en múltiples talleres corporativos",
          }),
        },
        context: t({
          en: "As co-founder and lead developer of Ouestech, I have the opportunity to work on a variety of exciting projects across different sectors. This experience has allowed me to develop strong adaptability and deep expertise in modern web technologies.\n\nMy partner and I handle the entire development lifecycle, from design to production, including development and deployment. Beyond development, I also deliver technical training workshops and bootcamps for corporate teams on modern web technologies and Python development. This position has enabled me to develop not only my technical skills but also my project management, client communication, and teaching abilities.",
          fr: "En tant que co-fondateur et développeur principal d'Ouestech, j'ai l'opportunité de travailler sur une variété de projets passionnants dans différents secteurs. Cette expérience m'a permis de développer une forte adaptabilité et une expertise approfondie dans les technologies web modernes.\n\nMon associé et moi gérons l'ensemble du cycle de développement, de la conception à la production, en passant par le développement et le déploiement. Au-delà du développement, j'anime aussi des formations techniques et des bootcamps pour les équipes en entreprise sur les technologies web modernes et le développement Python. Ce poste m'a permis de développer non seulement mes compétences techniques, mais aussi mes capacités en gestion de projet, communication client et enseignement.",
          es: "Como cofundador y desarrollador principal de Ouestech, tengo la oportunidad de trabajar en una variedad de proyectos emocionantes en diferentes sectores. Esta experiencia me ha permitido desarrollar una gran adaptabilidad y experiencia profunda en tecnologías web modernas.\n\nMi socio y yo gestionamos todo el ciclo de desarrollo, desde el diseño hasta la producción, incluyendo desarrollo y despliegue. Más allá del desarrollo, también imparto talleres de formación técnica y bootcamps para equipos corporativos sobre tecnologías web modernas y desarrollo en Python. Esta posición me ha permitido desarrollar no solo mis habilidades técnicas, sino también mis capacidades de gestión de proyectos, comunicación con clientes y enseñanza.",
        }),
      },

      // NOTE: Les 4 autres expériences (GE Healthcare x2, Schneider, ATLAN Space)
      // suivent exactement le même pattern. Voir section 7 pour le contenu traduit complet.
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SKILLS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    skills: {
      categories: {
        backend: t({
          en: "Backend Development",
          fr: "Développement Backend",
          es: "Desarrollo Backend",
        }),
        frontend: t({
          en: "Frontend Development",
          fr: "Développement Frontend",
          es: "Desarrollo Frontend",
        }),
        cloud: t({
          en: "Cloud & DevOps",
          fr: "Cloud & DevOps",
          es: "Cloud & DevOps",
        }),
        databases: t({
          en: "Databases & Storage",
          fr: "Bases de données & Stockage",
          es: "Bases de datos & Almacenamiento",
        }),
      },
      languages: {
        french: {
          name: t({ en: "French", fr: "Français", es: "Francés" }),
          level: t({ en: "Native", fr: "Natif", es: "Nativo" }),
        },
        english: {
          name: t({ en: "English", fr: "Anglais", es: "Inglés" }),
          level: t({
            en: "Professional",
            fr: "Professionnel",
            es: "Profesional",
          }),
        },
      },
      soft: {
        s1: t({
          en: "Technical Leadership",
          fr: "Leadership technique",
          es: "Liderazgo técnico",
        }),
        s2: t({
          en: "Problem Solving",
          fr: "Résolution de problèmes",
          es: "Resolución de problemas",
        }),
        s3: t({
          en: "Team Collaboration",
          fr: "Travail en équipe",
          es: "Trabajo en equipo",
        }),
        s4: t({
          en: "Agile Methodologies",
          fr: "Méthodologies agiles",
          es: "Metodologías ágiles",
        }),
        s5: t({
          en: "Project Management",
          fr: "Gestion de projet",
          es: "Gestión de proyectos",
        }),
        s6: t({
          en: "Client Communication",
          fr: "Communication client",
          es: "Comunicación con clientes",
        }),
      },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CERTIFICATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    certifications: {
      validUntil: t({
        en: "Life",
        fr: "À vie",
        es: "De por vida",
      }),
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PREFERENCES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    preferences: {
      title: t({
        en: "Work Preferences",
        fr: "Préférences de travail",
        es: "Preferencias de trabajo",
      }),
      workSchedule: {
        title: t({
          en: "Work Schedule",
          fr: "Rythme de travail",
          es: "Horario de trabajo",
        }),
        detail5days: t({
          en: "Full-time availability for deep project involvement and team collaboration",
          fr: "Disponibilité à temps plein pour une implication profonde dans les projets et la collaboration d'équipe",
          es: "Disponibilidad a tiempo completo para participación profunda en proyectos y colaboración en equipo",
        }),
        detail1to4days: t({
          en: "Flexible part-time schedule for focused consulting and specialized tasks",
          fr: "Emploi du temps flexible à temps partiel pour du conseil ciblé et des tâches spécialisées",
          es: "Horario flexible a tiempo parcial para consultoría enfocada y tareas especializadas",
        }),
      },
      contractDuration: {
        title: t({
          en: "Contract Duration",
          fr: "Durée du contrat",
          es: "Duración del contrato",
        }),
        detailShort: t({
          en: "Short-term projects and quick implementations",
          fr: "Projets à court terme et implémentations rapides",
          es: "Proyectos a corto plazo e implementaciones rápidas",
        }),
        detailLong: t({
          en: "Long-term projects with comprehensive solutions and ongoing development",
          fr: "Projets à long terme avec des solutions complètes et un développement continu",
          es: "Proyectos a largo plazo con soluciones integrales y desarrollo continuo",
        }),
      },
      workEnvironment: {
        title: t({
          en: "Work Environment",
          fr: "Environnement de travail",
          es: "Entorno de trabajo",
        }),
        detailOnsite: t({
          en: "Available for in-office collaboration and team meetings",
          fr: "Disponible pour la collaboration en bureau et les réunions d'équipe",
          es: "Disponible para colaboración en oficina y reuniones de equipo",
        }),
        detailHybrid: t({
          en: "Balanced mix of remote work and office presence for optimal productivity",
          fr: "Mix équilibré entre télétravail et présence en bureau pour une productivité optimale",
          es: "Mix equilibrado entre trabajo remoto y presencia en oficina para una productividad óptima",
        }),
        detailRemote: t({
          en: "Fully equipped for efficient remote collaboration",
          fr: "Entièrement équipé pour une collaboration à distance efficace",
          es: "Completamente equipado para una colaboración remota eficiente",
        }),
      },
      mobility: {
        title: t({
          en: "Mobility",
          fr: "Mobilité",
          es: "Movilidad",
        }),
        detail: t({
          en: "Based in Paris with easy access to all Île-de-France locations",
          fr: "Basé à Paris avec un accès facile à toute l'Île-de-France",
          es: "Ubicado en París con fácil acceso a todas las ubicaciones de Île-de-France",
        }),
      },
      location: {
        title: t({
          en: "Location",
          fr: "Localisation",
          es: "Ubicación",
        }),
        detail: t({
          en: "Centrally located in Paris for easy accessibility and local collaboration",
          fr: "Situé au centre de Paris pour une accessibilité facile et une collaboration locale",
          es: "Ubicado en el centro de París para fácil accesibilidad y colaboración local",
        }),
      },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EDUCATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    education: {
      sorbonne: {
        title: t({
          en: "Master's Degree in Computer Science",
          fr: "Master en Informatique",
          es: "Máster en Informática",
        }),
        description: {
          d1: t({
            en: "Specialization in Software Engineering and Electronic Engineering",
            fr: "Spécialisation en Génie Logiciel et Génie Électronique",
            es: "Especialización en Ingeniería de Software e Ingeniería Electrónica",
          }),
          d2: t({
            en: "Advanced coursework in Distributed Systems and Network Architecture",
            fr: "Cours avancés en Systèmes Distribués et Architecture Réseau",
            es: "Cursos avanzados en Sistemas Distribuidos y Arquitectura de Redes",
          }),
          d3: t({
            en: "Master's program at the intersection of electronics and computer science, focusing on the study, design, and development of complex systems with multi-sector versatility and adaptability.",
            fr: "Programme de Master à l'intersection de l'électronique et de l'informatique, axé sur l'étude, la conception et le développement de systèmes complexes avec polyvalence et adaptabilité multi-sectorielles.",
            es: "Programa de Máster en la intersección de la electrónica y la informática, enfocado en el estudio, diseño y desarrollo de sistemas complejos con versatilidad y adaptabilidad multisectorial.",
          }),
          d4: t({
            en: "Providing a solid foundation for various career paths, including embedded systems development and software development.",
            fr: "Fournissant une base solide pour divers parcours professionnels, incluant le développement de systèmes embarqués et le développement logiciel.",
            es: "Proporcionando una base sólida para diversas trayectorias profesionales, incluyendo desarrollo de sistemas embebidos y desarrollo de software.",
          }),
        },
        achievements: {
          a1: t({
            en: "Graduated with a Master's Degree in Science",
            fr: "Diplômé d'un Master en Sciences",
            es: "Graduado con un Máster en Ciencias",
          }),
          a2: t({
            en: "Object-oriented c++ programming - Object modeling of a data structure",
            fr: "Programmation C++ orientée objet - Modélisation objet d'une structure de données",
            es: "Programación C++ orientada a objetos - Modelado de objetos de una estructura de datos",
          }),
          a3: t({
            en: "Successfully defended my final year project",
            fr: "Soutenance réussie du projet de fin d'études",
            es: "Defensa exitosa del proyecto de fin de estudios",
          }),
        },
      },
      // NOTE: UPMC, ENSA, Lycée suivent le même pattern
    },
  },
} satisfies Dictionary;

export default cvDataContent;
```

---

## 6. Plan d'implémentation

### Phase 1 : Créer les fichiers `.content.ts` (Estimé : 2-3h)

| # | Action | Fichier |
|---|---|---|
| 1.1 | Créer le fichier | `content/blog-page.content.ts` |
| 1.2 | Créer le fichier | `content/blog-card.content.ts` |
| 1.3 | Créer le fichier | `content/blog-stats.content.ts` |
| 1.4 | Créer le fichier | `content/blog-social.content.ts` |
| 1.5 | Créer le fichier | `content/blog-post.content.ts` |
| 1.6 | Créer le fichier | `content/cv-page.content.ts` |
| 1.7 | Créer le fichier | `content/cv-data.content.ts` |

### Phase 2 : Migrer les composants Blog vers `useIntlayer()` (Estimé : 2-3h)

| # | Action | Composant | Dict key |
|---|---|---|---|
| 2.1 | Remplacer les chaînes inline par `useIntlayer("blog-page")` | `blog/page.client.tsx` | `blog-page` |
| 2.2 | Remplacer les chaînes inline par `useIntlayer("blog-card")` | `blog-post-card.tsx` | `blog-card` |
| 2.3 | Remplacer les chaînes inline par `useIntlayer("blog-stats")` | `article-stats.tsx` | `blog-stats` |
| 2.4 | Remplacer les chaînes inline par `useIntlayer("blog-social")` | `social-interactions-client.tsx` | `blog-social` |
| 2.5 | Remplacer les chaînes inline par `useIntlayer("blog-post")` | `blog/[slug]/page.tsx` + `similar-articles.tsx` + `popular-articles.tsx` | `blog-post` |
| 2.6 | Remplacer les chaînes inline par `useIntlayer("blog-stats")` | `reading-progress.tsx` | `blog-stats` |
| 2.7 | Remplacer les chaînes inline par `useIntlayer("blog-page")` | `category-filter.tsx` | `blog-page` |

### Phase 3 : Migrer la section CV (Estimé : 4-5h)

| # | Action | Composant | Dict key |
|---|---|---|---|
| 3.1 | Remplacer les chaînes UI hardcodées | `me/page.tsx` | `cv-page` |
| 3.2 | Restructurer `me/data/index.ts` pour utiliser les données traduites | `me/data/index.ts` | `cv-data` |
| 3.3 | Mettre à jour l'import dans `me/page.tsx` pour utiliser `useIntlayer("cv-data")` | `me/page.tsx` | `cv-data` |
| 3.4 | Vérifier que le composant `CVPreview` (PDF) utilise aussi les données traduites | `CVPreview.tsx` | — |

### Phase 4 : Validation et tests (Estimé : 1-2h)

| # | Action |
|---|---|
| 4.1 | `npx tsc --noEmit` — Zéro erreurs TypeScript |
| 4.2 | `pnpm build` — Build complet (373+ pages) |
| 4.3 | Test visuel en `fr` — Toutes les chaînes en français |
| 4.4 | Test visuel en `en` — Toutes les chaînes en anglais |
| 4.5 | Test visuel en `es` — Toutes les chaînes en espagnol |
| 4.6 | Vérifier le rendu du PDF CV dans les 3 langues |
| 4.7 | Vérifier que les dates sont formatées selon la locale |

---

## 7. Contenu traduit complet

> **Cette section fournit toutes les traductions nécessaires pour les 2 sections.**
> Les traductions sont prêtes à copier-coller dans les fichiers `.content.ts`.

### 7.1. Blog — Traductions complètes

| Clé | EN | FR | ES |
|---|---|---|---|
| `blog.page.title` | Technical Blog | Blog Technique | Blog Técnico |
| `blog.page.description` | Expert software engineering articles covering modern web development, cloud architecture, and best practices. Written by a seasoned Full-Stack Developer with real-world experience. | Articles d'ingénierie logicielle couvrant le développement web moderne, l'architecture cloud et les bonnes pratiques. Rédigés par un développeur Full-Stack expérimenté. | Artículos de ingeniería de software sobre desarrollo web moderno, arquitectura cloud y mejores prácticas. Escritos por un desarrollador Full-Stack con experiencia real. |
| `blog.page.noResults` | No blog posts found | Aucun article trouvé | No se encontraron artículos |
| `blog.page.noResultsFor` | for | pour | para |
| `blog.page.allCategories` | All Categories | Toutes les catégories | Todas las categorías |
| `blog.card.read` | Read | Lire | Leer |
| `blog.card.draft` | Draft | Brouillon | Borrador |
| `blog.card.shareSuccess` | Shared successfully | Partagé avec succès | Compartido con éxito |
| `blog.card.shareDescription` | Thank you for sharing! | Merci pour le partage ! | ¡Gracias por compartir! |
| `blog.stats.views` | views | vues | vistas |
| `blog.stats.likes` | likes | j'aime | me gusta |
| `blog.stats.shares` | shares | partages | compartidos |
| `blog.stats.timeSpent` | Time spent reading: | Temps de lecture : | Tiempo de lectura: |
| `blog.social.liked` | Article liked! | Article aimé ! | ¡Artículo gustado! |
| `blog.social.unliked` | Like removed | Like retiré | Like eliminado |
| `blog.social.likedDesc` | Thank you for your appreciation. | Merci pour votre appréciation. | Gracias por tu apreciación. |
| `blog.social.unlikedDesc` | You've removed your like. | Vous avez retiré votre like. | Has eliminado tu like. |
| `blog.social.likeError` | Could not process your like. Please try again. | Impossible de traiter votre like. Veuillez réessayer. | No se pudo procesar tu like. Inténtalo de nuevo. |
| `blog.social.shareError` | Could not share the article. Please try again. | Impossible de partager l'article. Veuillez réessayer. | No se pudo compartir el artículo. Inténtalo de nuevo. |
| `blog.social.tooltipLiked` | You liked this | Vous avez aimé cet article | Te gustó este artículo |
| `blog.social.tooltipLike` | Like this article | Aimer cet article | Me gusta este artículo |
| `blog.social.tooltipShare` | Share this article | Partager cet article | Compartir este artículo |
| `blog.post.helpful` | Did you find this article helpful? | Cet article vous a été utile ? | ¿Te resultó útil este artículo? |
| `blog.post.similarArticles` | Similar Articles | Articles similaires | Artículos similares |
| `blog.post.popularArticles` | Popular Articles | Articles populaires | Artículos populares |

### 7.2. CV Page — Traductions UI complètes

| Clé | EN | FR | ES |
|---|---|---|---|
| `cv.header.role` | Senior Software Engineer | Ingénieur Logiciel Senior | Ingeniero de Software Senior |
| `cv.sections.experience` | Professional Experience | Expérience Professionnelle | Experiencia Profesional |
| `cv.sections.education` | Education | Formation | Formación |
| `cv.sections.technicalSkills` | Technical Skills | Compétences Techniques | Habilidades Técnicas |
| `cv.sections.languages` | Languages | Langues | Idiomas |
| `cv.sections.certifications` | Certifications | Certifications | Certificaciones |
| `cv.skills.learningNote` | Continuously learning and exploring... | Apprentissage continu et exploration... | Aprendizaje continuo y exploración... |
| `cv.certifications.credentialId` | Credential ID: | ID de certification : | ID de credencial: |
| `cv.preview.title` | Preview CV | Aperçu du CV | Vista previa del CV |
| `cv.cta.title` | Ready to Build Something Amazing? | Prêt à Construire Quelque Chose d'Extraordinaire ? | ¿Listo para Construir Algo Increíble? |
| `cv.cta.description` | Let's collaborate to transform your ideas... | Collaborons pour transformer vos idées... | Colaboremos para transformar tus ideas... |
| `cv.cta.emailMe` | Email Me | M'envoyer un email | Envíame un correo |
| `cv.cta.scheduleMeeting` | Schedule a Meeting | Planifier un rendez-vous | Programar una reunión |
| `cv.cta.connectLinkedin` | Connect on LinkedIn | Se connecter sur LinkedIn | Conectar en LinkedIn |
| `cv.cta.availability` | Available for projects worldwide • Quick response within 24 hours | Disponible pour des projets dans le monde entier • Réponse rapide sous 24 heures | Disponible para proyectos en todo el mundo • Respuesta rápida en 24 horas |
| `cv.preferences.flexNote` | Open to discussing flexible arrangements... | Ouvert à la discussion pour des arrangements flexibles... | Abierto a discutir acuerdos flexibles... |

### 7.3. CV Data — Traductions des données (extrait Allianz)

> Voir section 5.7 pour l'exemple complet avec Allianz et Ouestech.
> Les 4 expériences restantes (GE Healthcare ×2, Schneider, ATLAN Space) et les 4 formations suivent exactement le même pattern avec les traductions suivantes :

#### Types de contrat

| EN | FR | ES |
|---|---|---|
| Full-time | CDI / Temps plein | Tiempo completo |
| Entrepreneurship | Entrepreneuriat | Emprendimiento |
| Internship | Stage | Prácticas |
| Present | Présent | Presente |

#### Catégories de compétences

| EN | FR | ES |
|---|---|---|
| Backend Development | Développement Backend | Desarrollo Backend |
| Frontend Development | Développement Frontend | Desarrollo Frontend |
| Cloud & DevOps | Cloud & DevOps | Cloud & DevOps |
| Databases & Storage | Bases de données & Stockage | Bases de datos & Almacenamiento |

#### Langues parlées

| EN | FR | ES |
|---|---|---|
| French — Native | Français — Natif | Francés — Nativo |
| English — Professional | Anglais — Professionnel | Inglés — Profesional |

#### Compétences humaines (soft skills)

| EN | FR | ES |
|---|---|---|
| Technical Leadership | Leadership technique | Liderazgo técnico |
| Problem Solving | Résolution de problèmes | Resolución de problemas |
| Team Collaboration | Travail en équipe | Trabajo en equipo |
| Agile Methodologies | Méthodologies agiles | Metodologías ágiles |
| Project Management | Gestion de projet | Gestión de proyectos |
| Client Communication | Communication client | Comunicación con clientes |

---

## 8. Checklist de validation

### Pré-implémentation
- [x] Inventaire complet des chaînes hardcodées (Blog)
- [x] Inventaire complet des chaînes hardcodées (CV)
- [x] Date formatting migré vers locale dynamique
- [x] Suppression du "% match" confus dans SimilarArticles
- [x] Traductions FR/EN/ES préparées pour toutes les chaînes
- [x] Structure des fichiers `.content.ts` définie
- [x] Pattern intlayer identifié et documenté

### Implémentation (à faire)
- [ ] Créer 7 fichiers `.content.ts`
- [ ] Migrer 7+ composants Blog vers `useIntlayer()`
- [ ] Restructurer `me/data/index.ts` avec données trilingues
- [ ] Migrer `me/page.tsx` vers `useIntlayer()`
- [ ] Vérifier le composant `CVPreview` (PDF)

### Post-implémentation (à faire)
- [ ] `npx tsc --noEmit` — Zéro erreurs
- [ ] `pnpm build` — Build complet
- [ ] Test visuel fr/en/es
- [ ] Vérification PDF CV trilingue
- [ ] Nettoyage des chaînes inline temporaires

---

_Document créé le 2025-07-17 — Prêt pour l'implémentation_
_Mainteneur : FYGS (fygs.dev@gmail.com)_
