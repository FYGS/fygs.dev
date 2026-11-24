import { Role } from "../../../lib/generated/prisma/browser";

// Realistic seed data
export const realisticUsers = [
  {
    name: "Fernand Soualo",
    email: "fernand@fygs.dev",
    role: Role.INSTRUCTOR,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur Full-Stack avec 8 ans d'expérience, passionné par l'enseignement et les technologies modernes.",
    githubUrl: "https://github.com/fernand-soualo",
    linkedinUrl: "https://linkedin.com/in/fernand-soualo",
    websiteUrl: "https://fygs.dev",
  },
  {
    name: "Admin FYGS",
    email: "fygs.dev@gmail.com",
    role: Role.ADMIN,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Équipe d'administration de FYGS Academy",
    websiteUrl: "https://fygs.dev",
  },
  // Premium students
  {
    name: "Alice Martin",
    email: "alice.martin@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Designer UX/UI en reconversion vers le développement Full-Stack",
    githubUrl: "https://github.com/alice-martin",
    linkedinUrl: "https://linkedin.com/in/alice-martin",
    websiteUrl: "https://alicemartin.design",
  },
  {
    name: "Pierre Dubois",
    email: "pierre.dubois@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Ingénieur en informatique, spécialisé en développement web moderne",
    githubUrl: "https://github.com/pierre-dubois",
    linkedinUrl: "https://linkedin.com/in/pierre-dubois",
  },
  {
    name: "Sophie Leroy",
    email: "sophie.leroy@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    bio: "Développeuse junior passionnée par React et l'écosystème JavaScript",
    githubUrl: "https://github.com/sophie-leroy",
    websiteUrl: "https://sophieleroy.dev",
  },
  // Regular students
  {
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face",
    bio: "Étudiant en informatique, futur développeur web",
    githubUrl: "https://github.com/thomas-bernard",
  },
  {
    name: "Marie Petit",
    email: "marie.petit@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "Freelance en marketing digital, apprend le développement pour créer ses propres outils",
    linkedinUrl: "https://linkedin.com/in/marie-petit",
    websiteUrl: "https://mariepetit.fr",
  },
  {
    name: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur backend Python en transition vers JavaScript/TypeScript",
    githubUrl: "https://github.com/lucas-moreau",
    linkedinUrl: "https://linkedin.com/in/lucas-moreau",
  },
  {
    name: "Emma Rousseau",
    email: "emma.rousseau@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    bio: "Ancienne chef de projet, se forme au développement web pour créer sa startup",
    linkedinUrl: "https://linkedin.com/in/emma-rousseau",
    websiteUrl: "https://emma-startup.com",
  },
  {
    name: "Hugo Garcia",
    email: "hugo.garcia@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur mobile React Native, élargit ses compétences au web",
    githubUrl: "https://github.com/hugo-garcia",
  },
  {
    name: "Léa Martinez",
    email: "lea.martinez@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    bio: "Data scientist qui s'intéresse au développement d'applications web",
  },
  {
    name: "Nathan Wilson",
    email: "nathan.wilson@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    bio: "Développeur Java Enterprise cherchant à moderniser ses compétences",
  },
  {
    name: "Chloé Johnson",
    email: "chloe.johnson@example.com",
    role: Role.STUDENT,
    image:
      "https://images.unsplash.com/photo-1526346698789-22fd84314424?w=150&h=150&fit=crop&crop=face",
    bio: "Designer graphique qui apprend le code pour créer des expériences interactives",
  },
];
