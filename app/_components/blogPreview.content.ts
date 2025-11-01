import { t, type Dictionary } from "intlayer";

const blogPreviewContent = {
  key: "blog-preview",
  content: {
    badge: t({
      en: "Latest Articles",
      fr: "Derniers Articles",
      es: "Últimos Artículos",
    }),
    title: t({
      en: "Resources & Trends",
      fr: "Ressources & Tendances",
      es: "Recursos & Tendencias",
    }),
    description: t({
      en: "Discover the latest trends and tips in software development",
      fr: "Découvrez les dernières tendances et conseils en développement logiciel",
      es: "Descubre las últimas tendencias y consejos en desarrollo de software",
    }),
    seeAllButton: t({
      en: "See all articles",
      fr: "Voir tous les articles",
      es: "Ver todos los artículos",
    }),
  },
} satisfies Dictionary;

export default blogPreviewContent;
