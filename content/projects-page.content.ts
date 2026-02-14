import { t, type Dictionary } from "intlayer";

const projectsPageContent = {
  key: "projects-page",
  content: {
    title: t({
      en: "Featured Projects",
      fr: "Projets Phares",
      es: "Proyectos Destacados",
    }),
    description: t({
      en: "Each project is crafted with attention to detail, focusing on performance, scalability, and user experience.",
      fr: "Chaque projet est conçu avec soin, en mettant l'accent sur la performance, la scalabilité et l'expérience utilisateur.",
      es: "Cada proyecto está diseñado con atención al detalle, enfocándose en rendimiento, escalabilidad y experiencia de usuario.",
    }),
    noResults: t({
      en: "No projects found with the selected technologies.",
      fr: "Aucun projet trouvé avec les technologies sélectionnées.",
      es: "No se encontraron proyectos con las tecnologías seleccionadas.",
    }),
    viewDetails: t({
      en: "View Details",
      fr: "Voir le détail",
      es: "Ver detalles",
    }),
    readMore: t({
      en: "Read More",
      fr: "Lire la suite",
      es: "Leer más",
    }),
  },
} satisfies Dictionary;

export default projectsPageContent;
