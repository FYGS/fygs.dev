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
