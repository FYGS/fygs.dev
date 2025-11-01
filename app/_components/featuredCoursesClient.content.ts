import { t, type Dictionary } from "intlayer";

const featuredCoursesClientContent = {
  key: "featured-courses-client",
  content: {
    noFeaturedCourses: t({
      en: "No featured courses available at the moment.",
      es: "No hay cursos destacados disponibles en este momento.",
      fr: "Aucun cours en vedette disponible pour le moment.",
    }),
    premiumCoursesLabel: t({
      en: "Premium Courses",
      es: "Cursos Premium",
      fr: "Cours Premium",
    }),
    mostPopularCoursesTitle: t({
      en: "Most Popular Courses",
      es: "Cursos Más Populares",
      fr: "Cours Les Plus Populaires",
    }),
    mostPopularCoursesDescription: t({
      en: "Join thousands of developers transforming their careers with our premium courses.",
      es: "Únete a miles de desarrolladores que están transformando sus carreras con nuestros cursos premium.",
      fr: "Rejoignez des milliers de développeurs qui transforment leur carrière avec nos cours premium.",
    }),
    viewAllCoursesButton: t({
      en: "View all courses",
      es: "Ver todos los cursos",
      fr: "Voir tous les cours",
    }),
  },
} satisfies Dictionary;

export default featuredCoursesClientContent;
