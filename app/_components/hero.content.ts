import { t, type Dictionary } from "intlayer";

const heroContent = {
  key: "hero",
  content: {
    title: t({
      en: "Fernand Soualo",
      fr: "Fernand Soualo",
      es: "Fernand Soualo",
    }),
    subtitle: t({
      en: "Software Engineer & Tech Educator",
      fr: "Ingénieur Logiciel & Éducateur Tech",
      es: "Ingeniero de Software y Educador Técnico",
    }),
    description: t({
      en: "I am passionate about creating impactful software and empowering developers through education. With expertise in modern fullstack development, I build solutions that are both functional and aesthetically pleasing.",
      fr: "Je suis passionné par la création de logiciels impactants et l'autonomisation des développeurs par l'éducation. Avec une expertise dans le développement fullstack moderne, je construis des solutions à la fois fonctionnelles et esthétiquement agréables.",
      es: "Me apasiona crear software impactante y empoderar a los desarrolladores a través de la educación. Con experiencia en desarrollo fullstack moderno, construyo soluciones que son tanto funcionales como estéticamente agradables.",
    }),
    techStack: ["React", "Next.js", "TypeScript", "Node.js", "NestJS", "AWS"],
    location: t({
      en: "Paris, France",
      fr: "Paris, France",
      es: "París, Francia",
    }),
    contact: t({
      en: "Contact",
      fr: "Contact",
      es: "Contacto",
    }),
  },
} satisfies Dictionary;

export default heroContent;
