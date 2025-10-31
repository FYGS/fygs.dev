import { t } from 'intlayer';
import { type Dictionary } from 'intlayer';
import {
  LeafyGreenIcon,
  Building2,
  BrainCircuit,
  Network,
  Utensils,
  GraduationCap,
  LayoutPanelLeft,
  Fingerprint,
  Loader,
  Gift,
} from 'lucide-react';

const statusContent = {
    key: "status",
    content: {
        title: t({
            en: "Portfolio & Contact",
            fr: "Portfolio & Contact",
            es: "Portafolio & Contacto",
        }),
        subtitle: t({
            en: "Projects & Contact",
            fr: "Projets & Contact",
            es: "Proyectos & Contacto",
        }),
        description: t({
            en: "Discover my personal projects and how to contact me",
            fr: "Découvrez mes projets personnels et comment me contacter",
            es: "Descubre mis proyectos personales y cómo contactarme",
        }),
        sideProjectTitle: t({
            en: "Fun Side Projects",
            fr: "Projets Amusants",
            es: "Proyectos Divertidos",
        }),
        workTitle: t({
            en: "Background",
            fr: "Expériences",
            es: "Experiencia",
        }),
        works: [
            {
                image: "/companies/allianz_technology_logo.jpg",
                title: "Allianz Technology",
                role: t({
                    en: "Backend Developer",
                    fr: "Développeur Backend",
                    es: "Desarrollador Backend",
                }),
                date: "2023-Present",
                url: "https://www.linkedin.com/company/allianz-technology/posts/?feedView=all",
            },
            {
                image: "/companies/ge_healthcare_logo.png",
                title: "GE Healthcare",
                role: t({
                    en: "Software Engineer",
                    fr: "Ingénieur Logiciel",
                    es: "Ingeniero de Software",
                }),
                date: "2019-2023",
                url: "https://www.linkedin.com/company/gehealthcare/posts/?feedView=all",
            },
            {
                image: "/companies/schneider_electric_logo.webp",
                title: "Schneider Electric",
                role: t({
                    en: "Software Development Engineer",
                    fr: "Ingénieur Développement Logiciel",
                    es: "Ingeniero de Desarrollo de Software",
                }),
                date: "2019-2019",
                url: "https://www.linkedin.com/company/schneider-electric/posts/?feedView=all",
            },
            {
                image: "/companies/ouestech_logo.png",
                title: "Ouestech",
                role: t({
                    en: "Full Stack Software Development",
                    fr: "Développement Logiciel Full Stack",
                    es: "Desarrollo de Software Full Stack",
                }),
                date: "2019-Present",
                url: "https://www.linkedin.com/company/ouestech-sarl/posts/?feedView=all",
                freelance: true,
            },
            {
                image: "/companies/atlan_space_logo.png",
                title: "Atlan Space",
                role: t({
                    en: "Embedded Software Development",
                    fr: "Développement de Logiciels Embarqués",
                    es: "Desarrollo de Software Embebido",
                }),
                date: "2017-2017",
                url: "https://www.linkedin.com/company/atlanspace/posts/?feedView=all",
            },
        ],
        contactTitle: t({
            en: "Contact",
            fr: "Contact",
            es: "Contacto",
        }),
        sideProjects: [
            {
                id: "evopur",
                Logo: LeafyGreenIcon,
                title: "Evopur",
                description: t({
                    en: "Professional ecological household cleaning services platform offering comprehensive home cleaning solutions with eco-friendly products and sustainable practices for a healthier living environment.",
                    fr: "Une plateforme de services de nettoyage écologique professionnel offrant des solutions de nettoyage à domicile complètes avec des produits respectueux de l'environnement et des pratiques durables pour un environnement de vie plus sain.",
                    es: "Una plataforma de servicios de limpieza ecológica profesional que ofrece soluciones de limpieza integral para el hogar con productos ecológicos y prácticas sostenibles para un entorno de vida más saludable.",
                }),
                url: "https://evopur.ca",
            },
            {
                id: "ncr",
                Logo: Building2,
                title: "NCR - Certificats de Résidence",
                description: t({
                    en: "A next-generation platform modernizing residence certificate management, streamlining administrative processes for local authorities and citizens alike.",
                    fr: "Une plateforme de nouvelle génération modernisant la gestion des certificats de résidence, rationalisant les processus administratifs pour les autorités locales et les citoyens.",
                    es: "Una plataforma de nueva generación que moderniza la gestión de certificados de residencia, agilizando los procesos administrativos para autoridades locales y ciudadanos.",
                }),
                url: "https://ncr.ouestech.com/",
            },
            {
                id: "quizzen",
                Logo: BrainCircuit,
                title: "QuizZen",
                description: t({
                    en: "A specialized interactive platform for French naturalization interview preparation, covering history, values, and institutions of the French Republic.",
                    fr: "Une plateforme interactive spécialisée pour la préparation à l'entretien de naturalisation française, couvrant l'histoire, les valeurs et les institutions de la République française.",
                    es: "Una plataforma interactiva especializada para la preparación de entrevistas de naturalización francesa, cubriendo historia, valores e instituciones de la República Francesa.",
                }),
                url: "https://quizzen.fr/fr",
            },
            {
                id: "anumerique",
                Logo: Network,
                title: "A'Numérique",
                description: t({
                    en: "An innovative service bridging the digital divide through personalized, at-home digital literacy training, fostering an inclusive digital society.",
                    fr: "Un service innovant comblant la fracture numérique grâce à une formation personnalisée à domicile à la culture numérique, favorisant une société numérique inclusive.",
                    es: "Un servicio innovador que reduce la brecha digital mediante formación personalizada en alfabetización digital en el hogar, fomentando una sociedad digital inclusiva.",
                }),
                url: "https://www.anumerique.com/",
            },
            {
                id: "delices-rachetee",
                Logo: Utensils,
                title: "Les Délices de la Rachetée",
                description: t({
                    en: "An artisanal French pastry showcase combining traditional craftsmanship with innovative techniques to deliver unique culinary experiences.",
                    fr: "Une vitrine de pâtisseries françaises artisanales alliant savoir-faire traditionnel et techniques innovantes pour offrir des expériences culinaires uniques.",
                    es: "Una muestra de pastelería francesa artesanal que combina la artesanía tradicional con técnicas innovadoras para ofrecer experiencias culinarias únicas.",
                }),
                url: "https://lesdelicesdelarachetee.vercel.app/",
            },
            {
                id: "school-management",
                Logo: GraduationCap,
                title: "School Management System",
                description: t({
                    en: "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions.",
                    fr: "Un système complet de gestion scolaire conçu pour rationaliser les tâches administratives, améliorer la communication et accroître l'efficacité globale des établissements éducatifs.",
                    es: "Un sistema integral de gestión escolar diseñado para agilizar tareas administrativas, mejorar la comunicación y aumentar la eficiencia general en instituciones educativas.",
                }),
                url: "https://school-management-app-psi.vercel.app",
            },
            {
                id: "plura-saas",
                Logo: LayoutPanelLeft,
                title: "Plura SaaS App",
                description: t({
                    en: "A SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, project management module, and much more.",
                    fr: "Une application SaaS construite avec Next.js, TypeScript, Prisma, MySQL, NextAuth et Stripe, proposant un système d'abonnement, la création d'organisations et de sous-organisations, la création d'entonnoirs de vente, des sous-domaines, un module de gestion de projet, et bien plus encore.",
                    es: "Una aplicación SaaS construida con Next.js, TypeScript, Prisma, MySQL, NextAuth y Stripe, con sistema de suscripción, creación de organizaciones y suborganizaciones, creación de embudos de ventas, subdominios, módulo de gestión de proyectos y mucho más.",
                }),
                url: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
            },
            {
                id: "nextauth-v5",
                Logo: Fingerprint,
                title: "Next Auth v5 App",
                description: t({
                    en: "A Next.js application that implements authentication using NextAuth v5, featuring user registration, login, logout functionalities, and Multi-Factor Authentication (MFA) with email code verification.",
                    fr: "Une application Next.js qui implémente l'authentification avec NextAuth v5, proposant l'inscription, la connexion, la déconnexion et l'authentification multifacteur (MFA) avec vérification par code email.",
                    es: "Una aplicación Next.js que implementa autenticación con NextAuth v5, con registro de usuario, inicio/cierre de sesión y autenticación multifactor (MFA) con verificación por código de correo electrónico.",
                }),
                url: "https://gitlab.com/js-framework-projects/nextjs-projects/nextauth-v5-app",
            },
            {
                id: "js-universe",
                Logo: Loader,
                title: "JS Universe Blog App",
                description: t({
                    en: "A blog application built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
                    fr: "Une application de blog construite avec Gatsby et TypeScript, proposant la génération de site statique et un chargement progressif fluide des images, offrant une expérience frontend agréable avec des techniques avancées d'optimisation du rendu.",
                    es: "Una aplicación de blog construida con Gatsby y TypeScript, con generación de sitio estático y carga progresiva de imágenes, ofreciendo una experiencia frontend agradable con técnicas avanzadas de optimización de renderizado.",
                }),
                url: "https://js-universe-blog.netlify.app",
            },
            {
                id: "idees-kdo",
                Logo: Gift,
                title: "Idées KDO",
                description: t({
                    en: "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords.",
                    fr: "Une application innovante alimentée par l'IA qui génère des idées de cadeaux fantastiques adaptées à l'âge et à des mots-clés spécifiques.",
                    es: "Una aplicación innovadora impulsada por IA que genera ideas de regalos fantásticas adaptadas a la edad y palabras clave específicas.",
                }),
                url: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
            },
        ],
    },
} satisfies Dictionary;

export default statusContent;
