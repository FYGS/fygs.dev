import { t, type Dictionary } from "intlayer";

const clientComponentExampleContent = {
  key: "client-component-example",
  content: {
    title: t({
      fr: "Composant Client Exemple",
      en: "Client Component Example",
      es: "Ejemplo de Componente del Cliente",
    }),
    content: t({
      fr: "Ceci est un exemple de composant client utilisant next-intlayer pour la gestion du contenu localisé.",
      en: "This is an example of a client component using next-intlayer for localized content management.",
      es: "Este es un ejemplo de un componente del cliente que utiliza next-intlayer para la gestión de contenido localizado.",
    }),
  },
} satisfies Dictionary;

export default clientComponentExampleContent;
