import { t, type Dictionary } from "intlayer";

const testimonialsContent = {
  key: "testimonials",
  content: {
    badge: t({
      en: "Testimonials",
      fr: "Témoignages",
      es: "Testimonios",
    }),
    title: t({
      en: "They transformed their careers",
      fr: "Ils ont transformé leur carrière",
      es: "Transformaron sus carreras",
    }),
    description: t({
      en: "Discover how our courses have helped developers achieve their professional goals",
      fr: "Découvrez comment nos cours ont aidé les développeurs à atteindre leurs objectifs professionnels",
      es: "Descubre cómo nuestros cursos han ayudado a los desarrolladores a alcanzar sus objetivos profesionales",
    }),
    stats: [
      {
        label: t({
          en: "Students Trained",
          fr: "Étudiants Formés",
          es: "Estudiantes Capacitados",
        }),
        value: "15,000+",
      },
      {
        label: t({
          en: "Success Rate",
          fr: "Taux de Réussite",
          es: "Tasa de Éxito",
        }),
        value: "94%",
      },
      {
        label: t({
          en: "Average Salary Increase",
          fr: "Augmentation Salariale Moyenne",
          es: "Aumento Salarial Promedio",
        }),
        value: "+47%",
      },
    ],
    testimonials: [
      {
        id: 1,
        name: "Sarah Martinez",
        role: t({
          en: "Senior Frontend Developer",
          fr: "Développeuse Frontend Senior",
          es: "Desarrolladora Frontend Senior",
        }),
        company: "Spotify",
        avatar: "/api/placeholder/64/64",
        content: t({
          en: "The FYGS courses helped me advance from junior to senior in 8 months. The practical approach and real-world projects make all the difference.",
          fr: "Les cours FYGS m'ont aidée à passer de junior à senior en 8 mois. L'approche pratique et les projets réels font toute la différence.",
          es: "Los cursos de FYGS me ayudaron a avanzar de junior a senior en 8 meses. El enfoque práctico y los proyectos del mundo real marcan toda la diferencia.",
        }),
        rating: 5,
        course: t({
          en: "Advanced React",
          fr: "React Avancé",
          es: "React Avanzado",
        }),
        beforeRole: t({
          en: "Junior Developer",
          fr: "Développeuse Junior",
          es: "Desarrolladora Junior",
        }),
        afterRole: t({
          en: "Senior Frontend Developer",
          fr: "Développeuse Frontend Senior",
          es: "Desarrolladora Frontend Senior",
        }),
        salaryIncrease: "+45%",
      },
      {
        id: 2,
        name: "Thomas Dubois",
        role: t({
          en: "Fullstack Engineer",
          fr: "Ingénieur Fullstack",
          es: "Ingeniero Fullstack",
        }),
        company: "Airbnb",
        avatar: "/api/placeholder/64/64",
        content: t({
          en: "Thanks to the TypeScript and Node.js courses, I landed my dream job at Airbnb. The content is up-to-date and very professional.",
          fr: "Grâce aux cours TypeScript et Node.js, j'ai décroché mon emploi de rêve chez Airbnb. Le contenu est à jour et très professionnel.",
          es: "Gracias a los cursos de TypeScript y Node.js, conseguí mi trabajo soñado en Airbnb. El contenido está actualizado y es muy profesional.",
        }),
        rating: 5,
        course: t({
          en: "Fullstack TypeScript",
          fr: "TypeScript Fullstack",
          es: "TypeScript Fullstack",
        }),
        beforeRole: t({
          en: "Frontend Developer",
          fr: "Développeur Frontend",
          es: "Desarrollador Frontend",
        }),
        afterRole: t({
          en: "Fullstack Engineer",
          fr: "Ingénieur Fullstack",
          es: "Ingeniero Fullstack",
        }),
        salaryIncrease: "+60%",
      },
      {
        id: 3,
        name: "Marie Chen",
        role: t({
          en: "Tech Lead",
          fr: "Tech Lead",
          es: "Tech Lead",
        }),
        company: "Microsoft",
        avatar: "/api/placeholder/64/64",
        content: t({
          en: "Fernand's expertise in architecture and best practices helped me advance to a Tech Lead position. Exceptional courses!",
          fr: "L'expertise de Fernand en architecture et bonnes pratiques m'a aidée à accéder à un poste de Tech Lead. Des cours exceptionnels !",
          es: "La experiencia de Fernand en arquitectura y mejores prácticas me ayudó a avanzar a una posición de Tech Lead. ¡Cursos excepcionales!",
        }),
        rating: 5,
        course: t({
          en: "Architecture & Patterns",
          fr: "Architecture & Patterns",
          es: "Arquitectura & Patrones",
        }),
        beforeRole: t({
          en: "Senior Developer",
          fr: "Développeuse Senior",
          es: "Desarrolladora Senior",
        }),
        afterRole: t({
          en: "Tech Lead",
          fr: "Tech Lead",
          es: "Tech Lead",
        }),
        salaryIncrease: "+35%",
      },
      {
        id: 4,
        name: "Alex Johnson",
        role: t({
          en: "DevOps Engineer",
          fr: "Ingénieur DevOps",
          es: "Ingeniero DevOps",
        }),
        company: "Netflix",
        avatar: "/api/placeholder/64/64",
        content: t({
          en: "The Cloud and DevOps courses are incredible. I was able to implement complex solutions from my first week at Netflix.",
          fr: "Les cours Cloud et DevOps sont incroyables. J'ai pu implémenter des solutions complexes dès ma première semaine chez Netflix.",
          es: "Los cursos de Cloud y DevOps son increíbles. Pude implementar soluciones complejas desde mi primera semana en Netflix.",
        }),
        rating: 5,
        course: t({
          en: "Cloud & DevOps",
          fr: "Cloud & DevOps",
          es: "Cloud & DevOps",
        }),
        beforeRole: t({
          en: "Backend Developer",
          fr: "Développeur Backend",
          es: "Desarrollador Backend",
        }),
        afterRole: t({
          en: "DevOps Engineer",
          fr: "Ingénieur DevOps",
          es: "Ingeniero DevOps",
        }),
        salaryIncrease: "+50%",
      },
    ],
    careerEvolution: {
      before: t({
        en: "Before",
        fr: "Avant",
        es: "Antes",
      }),
      after: t({
        en: "After",
        fr: "Après",
        es: "Después",
      }),
      salary: t({
        en: "Salary",
        fr: "Salaire",
        es: "Salario",
      }),
    },
    navigation: {
      previous: t({
        en: "Previous testimonial",
        fr: "Témoignage précédent",
        es: "Testimonio anterior",
      }),
      next: t({
        en: "Next testimonial",
        fr: "Témoignage suivant",
        es: "Siguiente testimonio",
      }),
      goTo: t({
        en: "Go to testimonial",
        fr: "Aller au témoignage",
        es: "Ir al testimonio",
      }),
    },
  },
} satisfies Dictionary;

export default testimonialsContent;
