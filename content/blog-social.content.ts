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
