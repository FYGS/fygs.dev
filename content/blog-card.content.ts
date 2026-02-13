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
