import { t, type Dictionary } from "intlayer";

const contactContent = {
  key: "contact",
  content: {
    badge: t({
      en: "Let's Connect",
      fr: "Restons Connectés",
      es: "Conectémonos",
    }),
    title: t({
      en: "Get in Touch",
      fr: "Contactez-moi",
      es: "Contáctame",
    }),
    description: t({
      en: "Feel free to reach out to me through any of the following platforms. I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
      fr: "N'hésitez pas à me contacter via l'une des plateformes suivantes. Je suis toujours ouvert aux discussions sur de nouveaux projets, des idées créatives ou des opportunités de faire partie de votre vision.",
      es: "No dudes en contactarme a través de cualquiera de las siguientes plataformas. Siempre estoy abierto a discutir nuevos proyectos, ideas creativas u oportunidades de ser parte de tu visión.",
    }),
  },
} satisfies Dictionary;

export default contactContent;
