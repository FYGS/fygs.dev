import { t, type Dictionary } from "intlayer";

const cvPageContent = {
  key: "cv-page",
  content: {
    role: t({
      en: "Senior Software Engineer",
      fr: "Ingénieur Logiciel Senior",
      es: "Ingeniero de Software Senior",
    }),
    sections: {
      experience: t({
        en: "Professional Experience",
        fr: "Expérience Professionnelle",
        es: "Experiencia Profesional",
      }),
      education: t({
        en: "Education",
        fr: "Formation",
        es: "Formación",
      }),
      technicalSkills: t({
        en: "Technical Skills",
        fr: "Compétences Techniques",
        es: "Habilidades Técnicas",
      }),
      languages: t({
        en: "Languages",
        fr: "Langues",
        es: "Idiomas",
      }),
      certifications: t({
        en: "Certifications",
        fr: "Certifications",
        es: "Certificaciones",
      }),
      softSkills: t({
        en: "Soft Skills",
        fr: "Compétences Transversales",
        es: "Habilidades Interpersonales",
      }),
    },
    skills: {
      learningNote: t({
        en: "Continuously learning and exploring new technologies to stay at the forefront of web development.",
        fr: "Apprentissage continu et exploration de nouvelles technologies pour rester à la pointe du développement web.",
        es: "Aprendizaje continuo y exploración de nuevas tecnologías para estar a la vanguardia del desarrollo web.",
      }),
    },
    certifications: {
      credentialId: t({
        en: "Credential ID:",
        fr: "ID de certification :",
        es: "ID de credencial:",
      }),
    },
    preview: {
      title: t({
        en: "Preview CV",
        fr: "Aperçu du CV",
        es: "Vista previa del CV",
      }),
    },
    cta: {
      title: t({
        en: "Ready to Build Something Amazing?",
        fr: "Prêt à Construire Quelque Chose d'Extraordinaire ?",
        es: "¿Listo para Construir Algo Increíble?",
      }),
      description: t({
        en: "Let's collaborate to transform your ideas into exceptional digital solutions. I'm available for freelance projects and technical consulting.",
        fr: "Collaborons pour transformer vos idées en solutions digitales exceptionnelles. Je suis disponible pour des projets freelance et du conseil technique.",
        es: "Colaboremos para transformar tus ideas en soluciones digitales excepcionales. Estoy disponible para proyectos freelance y consultoría técnica.",
      }),
      emailMe: t({
        en: "Email Me",
        fr: "M'envoyer un email",
        es: "Envíame un correo",
      }),
      scheduleMeeting: t({
        en: "Schedule a Meeting",
        fr: "Planifier un rendez-vous",
        es: "Programar una reunión",
      }),
      connectLinkedin: t({
        en: "Connect on LinkedIn",
        fr: "Se connecter sur LinkedIn",
        es: "Conectar en LinkedIn",
      }),
      availability: t({
        en: "Available for projects worldwide • Quick response within 24 hours",
        fr: "Disponible pour des projets dans le monde entier • Réponse rapide sous 24 heures",
        es: "Disponible para proyectos en todo el mundo • Respuesta rápida en 24 horas",
      }),
    },
    preferences: {
      flexNote: t({
        en: "Open to discussing flexible arrangements based on project requirements",
        fr: "Ouvert à la discussion pour des arrangements flexibles selon les besoins du projet",
        es: "Abierto a discutir acuerdos flexibles según los requisitos del proyecto",
      }),
    },
  },
} satisfies Dictionary;

export default cvPageContent;
