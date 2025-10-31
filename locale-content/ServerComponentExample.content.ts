import { t, type Dictionary } from "intlayer";

const serverComponentExampleContent = {
  key: "server-component-example",
  content: {
    title: t({
      fr: "Composant Serveur Exemple",
      en: "Server Component Example",
      es: "Ejemplo de Componente del Servidor",
    }),
    content: t({
      fr: "Ceci est un exemple de composant serveur utilisant next-intlayer pour la gestion du contenu localisé.",
      en: "This is an example of a server component using next-intlayer for localized content management.",
      es: "Este es un ejemplo de un componente del servidor que utiliza next-intlayer para la gestión de contenido localizado.",
    }),
  },
} satisfies Dictionary;

export default serverComponentExampleContent;
