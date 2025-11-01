import { t, type Dictionary } from "intlayer";

const callToActionContent = {
  key: "call-to-action",
  content: {
    badge: t({
      en: "Limited Offer",
      fr: "Offre Limitée",
      es: "Oferta Limitada",
    }),
    title: {
      part1: t({
        en: "Transform your",
        fr: "Transformez votre",
        es: "Transforma tu",
      }),
      highlight: t({
        en: "developer",
        fr: "développeur",
        es: "desarrollador",
      }),
      part2: t({
        en: "career",
        fr: "carrière",
        es: "carrera",
      }),
    },
    description: t({
      en: "Join over 15,000 developers who have already boosted their careers with our premium courses. Start today!",
      fr: "Rejoignez plus de 15 000 développeurs qui ont déjà boosté leur carrière avec nos cours premium. Commencez aujourd'hui !",
      es: "Únete a más de 15,000 desarrolladores que ya han impulsado sus carreras con nuestros cursos premium. ¡Comienza hoy!",
    }),
    features: [
      {
        label: t({
          en: "Project-based learning",
          fr: "Apprentissage par projet",
          es: "Aprendizaje basado en proyectos",
        }),
        desc: t({
          en: "Practical and effective method",
          fr: "Méthode pratique et efficace",
          es: "Método práctico y efectivo",
        }),
      },
      {
        label: t({
          en: "Satisfaction guarantee",
          fr: "Garantie de satisfaction",
          es: "Garantía de satisfacción",
        }),
        desc: t({
          en: "Refund if not satisfied",
          fr: "Remboursement si non satisfait",
          es: "Reembolso si no está satisfecho",
        }),
      },
      {
        label: t({
          en: "24/7 Access",
          fr: "Accès 24/7",
          es: "Acceso 24/7",
        }),
        desc: t({
          en: "Learn at your own pace",
          fr: "Apprenez à votre rythme",
          es: "Aprende a tu propio ritmo",
        }),
      },
    ],
    cta: {
      primary: t({
        en: "Start Learning Now",
        fr: "Commencer à Apprendre",
        es: "Comenzar a Aprender",
      }),
      secondary: t({
        en: "View All Courses",
        fr: "Voir Tous les Cours",
        es: "Ver Todos los Cursos",
      }),
    },
    stats: [
      {
        value: "15,000+",
        label: t({
          en: "Active Students",
          fr: "Étudiants Actifs",
          es: "Estudiantes Activos",
        }),
      },
      {
        value: "50+",
        label: t({
          en: "Premium Courses",
          fr: "Cours Premium",
          es: "Cursos Premium",
        }),
      },
      {
        value: "94%",
        label: t({
          en: "Success Rate",
          fr: "Taux de Réussite",
          es: "Tasa de Éxito",
        }),
      },
    ],
    personalizedTraining: {
      value: t({
        en: "Personalized Training",
        fr: "Formation Personnalisée",
        es: "Formación Personalizada",
      }),
      description: t({
        en: "Tailored to your needs and goals",
        fr: "Adapté à vos besoins et objectifs",
        es: "Adaptado a tus necesidades y objetivos",
      }),
    },
    quickResults: {
      value: t({
        en: "Quick Results",
        fr: "Résultats Rapides",
        es: "Resultados Rápidos",
      }),
      description: t({
        en: "Visible progress in 30 days",
        fr: "Progrès visible en 30 jours",
        es: "Progreso visible en 30 días",
      }),
    },
    expertInstructors: {
      value: t({
        en: "Expert Instructors",
        fr: "Instructeurs Experts",
        es: "Instructores Expertos",
      }),
        description: t({
        en: "Learn from the best in the industry",
        fr: "Apprenez auprès des meilleurs du secteur",
        es: "Aprende de los mejores en la industria",
      }),
    },
    benefit: {
      title: t({
        en: "What You Get:",
        fr: "Ce que vous obtenez :",
        es: "Lo que obtienes:",
      }),
    },
    benefits: [
      t({
        en: "Unlimited access to all courses",
        fr: "Accès illimité à tous les cours",
        es: "Acceso ilimitado a todos los cursos",
      }),
      t({
        en: "Practical projects and certificates",
        fr: "Projets pratiques et certificats",
        es: "Proyectos prácticos y certificados",
      }),
      t({
        en: "24/7 community support",
        fr: "Support communautaire 24/7",
        es: "Soporte comunitario 24/7",
      }),
      t({
        en: "Free lifetime updates",
        fr: "Mises à jour gratuites à vie",
        es: "Actualizaciones gratuitas de por vida",
      }),
      t({
        en: "Early access to new courses",
        fr: "Accès anticipé aux nouveaux cours",
        es: "Acceso anticipado a nuevos cursos",
      }),
      t({
        en: "Personal mentoring session",
        fr: "Session de mentorat personnel",
        es: "Sesión de mentoría personal",
      }),
    ],
  },
} satisfies Dictionary;

export default callToActionContent;
