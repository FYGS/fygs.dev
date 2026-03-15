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
    sortLabel: t({
      en: "Sort by",
      fr: "Trier par",
      es: "Ordenar por",
    }),
    sortRecent: t({
      en: "Most Recent",
      fr: "Plus récents",
      es: "Más recientes",
    }),
    sortOldest: t({
      en: "Oldest First",
      fr: "Plus anciens",
      es: "Más antiguos",
    }),
    sortReadingTime: t({
      en: "Longest Read",
      fr: "Lecture longue",
      es: "Lectura larga",
    }),
  },
} satisfies Dictionary;

export default blogPageContent;
