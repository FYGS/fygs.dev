import { t, type Dictionary } from "intlayer";

const blogStatsContent = {
  key: "blog-stats",
  content: {
    views: t({ en: "views", fr: "vues", es: "vistas" }),
    view: t({ en: "view", fr: "vue", es: "vista" }),
    likes: t({ en: "likes", fr: "j'aime", es: "me gusta" }),
    like: t({ en: "like", fr: "j'aime", es: "me gusta" }),
    shares: t({ en: "shares", fr: "partages", es: "compartidos" }),
    share: t({ en: "share", fr: "partage", es: "compartido" }),
    timeSpent: t({
      en: "Time spent reading:",
      fr: "Temps de lecture :",
      es: "Tiempo de lectura:",
    }),
  },
} satisfies Dictionary;

export default blogStatsContent;
