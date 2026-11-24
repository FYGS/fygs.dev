import { t, type Dictionary } from "intlayer";

const headerContent = {
  key: "header",
  content: {
    navigation: {
      primary: [
        {
          href: "/me",
          label: t({
            en: "CV",
            fr: "CV",
            es: "CV",
          }),
        },
        {
          href: "/formations",
          label: t({
            en: "Formations",
            fr: "Formations",
            es: "Formaciones",
          }),
        },
        {
          href: "/projects",
          label: t({
            en: "Projects",
            fr: "Projets",
            es: "Proyectos",
          }),
        },
      ],
      secondary: [
        {
          href: "/parcours",
          label: t({
            en: "Learning paths",
            fr: "Parcours",
            es: "Rutas",
          }),
        },
        {
          href: "/blog",
          label: t({
            en: "Blog",
            fr: "Blog",
            es: "Blog",
          }),
        },
        {
          href: "/tech-mastry",
          label: t({
            en: "TechMastry",
            fr: "TechMastry",
            es: "TechMastry",
          }),
        },
        {
          href: "/contact",
          label: t({
            en: "Contact",
            fr: "Contact",
            es: "Contacto",
          }),
        },
      ],
    },
    social: {
      links: [
        {
          label: "LinkedIn",
        },
        {
          label: "GitHub",
        },
        {
          label: "GitLab",
        },
        {
          label: "Hashnode",
        },
      ],
      dropdownLabel: t({
        en: "Social Links",
        fr: "Liens Sociaux",
        es: "Enlaces Sociales",
      }),
    },
    mobile: {
      mainNavigation: t({
        en: "Main Navigation",
        fr: "Navigation Principale",
        es: "Navegación Principal",
      }),
      otherPages: t({
        en: "Other Pages",
        fr: "Autres Pages",
        es: "Otras Páginas",
      }),
      language: t({
        en: "Language",
        fr: "Langue",
        es: "Idioma",
      }),
      followMe: t({
        en: "Follow Me",
        fr: "Suivez-moi",
        es: "Sígueme",
      }),
    },
  },
} satisfies Dictionary;

export default headerContent;
