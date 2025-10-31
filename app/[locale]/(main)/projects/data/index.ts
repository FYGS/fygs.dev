import { Project } from "../types";

export const FEATURED_PROJECTS: Project[] = [
  {
    id: "evopur",
    title: "Evopur",
    description: "Professional ecological household cleaning services platform offering comprehensive home cleaning solutions with eco-friendly products and sustainable practices for a healthier living environment.",
    image: "/projects/evopur.png",
    detailImages: [
      {
        url: "/projects/evopur-home.png",
        alt: "Evopur Homepage"
      },
      {
        url: "/projects/evopur-home2.png",
        alt: "Evopur Services Page"
      },
      {
        url: "/projects/evopur-about.png",
        alt: "Evopur About Page"
      },
      {
        url: "/projects/evopur-contact.png",
        alt: "Evopur Contact Page"
      },
      {
        url: "/projects/evopur-blog.png",
        alt: "Evopur Blog Page"
      },
      {
        url: "/projects/evopur-testimonials.png",
        alt: "Evopur Testimonials Page"
      }
    ],
    technologies: [
      "Next.js 15",
      "TypeScript",
      "TailwindCSS",
      "Framer Motion",
      "React Hook Form",
      "Zod",
      "Nodemailer",
      "Translation",
      "VPS",
      "Coolify",
    ],
    link: "https://evopur.ca",
    features: [
      "🌿 Eco-friendly cleaning services showcase",
      "📅 Online booking system",
      "💚 Sustainable practices information",
      "📱 Mobile-responsive design",
      "✨ Smooth animations and transitions",
      "📧 Contact form with email notifications",
      "🏠 Service area coverage map",
      "💰 Transparent pricing structure",
      "⭐ Customer testimonials section",
      "🔒 Secure booking process"
    ],
    technicalDetails: "Built with Next.js 15 using the App Router, featuring server-side rendering for optimal SEO performance. Implements Framer Motion for smooth animations, React Hook Form with Zod validation for form handling, and Nodemailer for reliable email delivery. The design emphasizes sustainability with a green color palette and eco-friendly imagery.",
    challenges: "Creating a trustworthy and professional image for a cleaning service while emphasizing environmental responsibility. Implementing an intuitive booking system that captures all necessary service details while maintaining a simple user experience.",
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 3500
    },
    testimonial: {
      text: "Evopur transformed our approach to home cleaning with their exceptional eco-friendly services. The website perfectly reflects their commitment to sustainability.",
      author: "Marie Dubois",
      role: "Satisfied Customer"
    }
  },
  {
    id: "ncr",
    title: "NCR - Certificats de Résidence",
    description:
      "A next-generation platform modernizing residence certificate management, streamlining administrative processes for local authorities and citizens alike.",
    image: "/projects/ncr.png",
    detailImages: [
      {
        url: "/projects/ncr-home.png",
        alt: "NCR Homepage",
      },
      {
        url: "/projects/ncr-home-2.png",
        alt: "NCR Homepage 2",
      },
      {
        url: "/projects/ncr-home-3.png",
        alt: "NCR Homepage 3",
      },
      {
        url: "/projects/ncr-register-page.png",
        alt: "NCR Register Page",
      },
      {
        url: "/projects/ncr-login-page.png",
        alt: "NCR Login Page",
      },
      {
        url: "/projects/ncr-admin-dashboard.png",
        alt: "NCR Admin Dashboard",
      },
      {
        url: "/projects/ncr-admin-dashboard-2.png",
        alt: "NCR Admin Dashboard 2",
      },
      {
        url: "/projects/ncr-admin-dashboard-3.png",
        alt: "NCR Admin Dashboard 3",
      },
      {
        url: "/projects/ncr-admin-dashboard-4.png",
        alt: "NCR Admin Dashboard 4",
      },
    ],
    technologies: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "Appwrite",
      "TailwindCSS",
      "Docker",
      "Orange Money API",
    ],
    link: "https://ncr.ouestech.com",
    features: [
      "📝 Digital certificate requests",
      "🏢 Multi-tenant architecture",
      "👥 Role-based access control",
      "📊 Administrative dashboard",
      "🔍 Advanced search and filtering",
      "📱 Responsive design",
      "🔒 Secure document handling",
      "💳 Orange Money payment integration",
      "🧾 Automated payment receipts",
      "📱 Mobile money transactions",
    ],
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 3700
    },
    testimonial: {
      text: "NCR transformed our approach to certificate requests with their exceptional digitalization services. The website perfectly reflects their commitment to sustainability.",
      author: "Mohamed Kaba",
      role: "Satisfied Customer"
    },
    technicalDetails:
      "Built with Next.js 14, implementing a multi-tenant architecture for different municipalities. Uses Appwrite database as a service for robust data management and Docker for containerization. Integrates Orange Money API for secure mobile payments with real-time transaction validation.",
    challenges:
      "Implementing a secure and compliant system for handling sensitive administrative documents while ensuring ease of use for both citizens and municipal staff. Integrating Orange Money payment system with proper error handling and transaction reconciliation.",
  },
  {
    id: "quizzen",
    title: "QuizZen",
    description:
      "A specialized interactive platform for French naturalization interview preparation, covering history, values, and institutions of the French Republic.",
    image: "/projects/quizzen.png",
    detailImages: [
      {
        url: "/projects/quizzen-home.png",
        alt: "QuizZen Homepage",
      },

      {
        url: "/projects/quizzen-home-2.png",
        alt: "QuizZen Homepage 2",
      },
      {
        url: "/projects/quizzen-home-3.png",
        alt: "QuizZen Homepage 3",
      },
      {
        url: "/projects/quizzen-home-4.png",
        alt: "QuizZen Homepage 4",
      },
      {
        url: "/projects/quizzen-home-5.png",
        alt: "QuizZen Homepage 5",
      },
      {
        url: "/projects/quizzen-home-6.png",
        alt: "QuizZen Homepage 6",
      },
      {
        url: "/projects/quizzen-home-7.png",
        alt: "QuizZen Homepage 7",
      },
      {
        url: "/projects/quizzen-register-page.png",
        alt: "QuizZen Register Page",
      },
      {
        url: "/projects/quizzen-login-page.png",
        alt: "QuizZen Login Page",
      },
    ],
    technologies: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
      "Stripe",
      "i18n",
    ],
    link: "https://quizzen.fr/fr",
    features: [
      "📚 Comprehensive study material",
      "✅ Practice tests",
      "📊 Progress tracking",
      "🎯 Personalized learning paths",
      "🌍 Multi-language support",
      "📱 Mobile-responsive design",
    ],
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 2500
    },
    technicalDetails:
      "Built with Next.js 15, using Prisma ORM with PostgreSQL for robust data management. Implements spaced repetition algorithms for optimal learning with efficient database querying. Features a robust assessment system with detailed analytics and progress tracking.",
    challenges:
      "Creating an engaging learning experience while maintaining historical accuracy and official requirements for naturalization interviews. Optimizing database queries for efficient spaced repetition algorithm implementation.",
  },
  {
    id: "anumerique",
    title: "A'Numérique",
    description:
      "An innovative service bridging the digital divide through personalized, at-home digital literacy training, fostering an inclusive digital society.",
    image: "/projects/anumerique.png",
    detailImages: [
      {
        url: "/projects/anumerique-home.png",
        alt: "A'Numérique Homepage",
      },
      {
        url: "/projects/anumerique-home-2.png",
        alt: "A'Numérique Homepage 2",
      },
      {
        url: "/projects/anumerique-home-3.png",
        alt: "A'Numérique Homepage 3",
      },
      {
        url: "/projects/anumerique-home-4.png",
        alt: "A'Numérique Homepage 4",
      },
    ],
    technologies: [
      "Next.js 15",
      "TypeScript",
      "PostgreSQL",
      "TailwindCSS",
      "Stripe",
      "Google Calendar API",
    ],
    link: "https://www.anumerique.com",
    features: [
      "📅 Appointment scheduling",
      "👨‍🏫 Personalized training sessions",
      "📊 Progress tracking",
      "🏠 At-home service management",
      "💳 Secure payment processing",
      "📱 Mobile-first design",
    ],
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 2000
    },
    technicalDetails:
      "Integrates with Google Calendar for scheduling and Stripe for payments. Features a custom CRM system for managing client relationships and training progress.",
    challenges:
      "Developing an intuitive interface for both trainers and clients while managing complex scheduling and resource allocation.",
  },
  {
    id: "delices-rachetee",
    title: "Les Délices de la Rachetée",
    description:
      "An artisanal French pastry showcase combining traditional craftsmanship with innovative techniques to deliver unique culinary experiences.",
    image: "/projects/delices-rachetee.png",
    detailImages: [
      {
        url: "/projects/delices-rachetee-home.png",
        alt: "Les Délices de la Rachetée Homepage",
      },
      {
        url: "/projects/delices-creation.png",
        alt: "Les Délices de la Rachetée Creation",
      },
      {
        url: "/projects/delices-galerie.png",
        alt: "Les Délices de la Rachetée Galerie",
      },
      {
        url: "/projects/delices-histoire.png",
        alt: "Les Délices de la Rachetée Histoire",
      },
    ],
    technologies: [
      "Next.js 15",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
      "Stripe",
    ],
    link: "https://lesdelicesdelarachetee.vercel.app",
    features: [
      "🛒 Online ordering system",
      "🎂 Custom cake designer",
      "📅 Event scheduling",
      "🏷️ Product catalog",
      "💳 Secure payments",
      "📱 Responsive design",
    ],
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 2000
    },
    technicalDetails:
      "Built with Next.js 15, featuring a custom product configuration system and real-time order tracking. Implements Stripe for secure payment processing.",
    challenges:
      "Creating an intuitive interface for custom cake orders while managing complex product configurations and delivery scheduling.",
  },
  {
    id: "school-management",
    title: "School Management System",
    description:
      "A comprehensive School Management System designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions. Features include student management, attendance tracking, grade management, and parent communication portal.",
    image: "/projects/school-management.png",
    detailImages: [
      {
        url: "/projects/school-management-admin-assignments.png",
        alt: "School Management Admin Assignments Dashboard",
      },
      {
        url: "/projects/school-management-admin-classes.png",
        alt: "School Management Admin Classes Dashboard",
      },
      {
        url: "/projects/school-management-admin-classes-update.png",
        alt: "School Management Admin Classes Update Dashboard",
      },
      {
        url: "/projects/school-management-admin-exams.png",
        alt: "School Management Admin Exams Dashboard",
      },
      {
        url: "/projects/school-management-admin-exams-update.png",
        alt: "School Management Admin Exams Update Dashboard",
      },
      {
        url: "/projects/school-management-admin-home.png",
        alt: "School Management Admin Home Dashboard",
      },
      {
        url: "/projects/school-management-admin-lessons.png",
        alt: "School Management Admin Lessons Dashboard",
      },
      {
        url: "/projects/school-management-admin-parents.png",
        alt: "School Management Admin Parents Dashboard",
      },
      {
        url: "/projects/school-management-admin-results.png",
        alt: "School Management Admin Results Dashboard",
      },
      {
        url: "/projects/school-management-admin-students.png",
        alt: "School Management Admin Students Dashboard",
      },
      {
        url: "/projects/school-management-admin-students-detail.png",
        alt: "School Management Admin Students Detail Dashboard",
      },
      {
        url: "/projects/school-management-admin-students-detail-update.png",
        alt: "School Management Admin Students Detail Update Dashboard",
      },
      {
        url: "/projects/school-management-admin-subjects.png",
        alt: "School Management Admin Subjects Dashboard",
      },
      {
        url: "/projects/school-management-admin-subjects-update.png",
        alt: "School Management Admin Subjects Update Dashboard",
      },
      {
        url: "/projects/school-management-admin-teachers.png",
        alt: "School Management Admin Teachers Dashboard",
      },
      {
        url: "/projects/school-management-admin-teachers-detail.png",
        alt: "School Management Admin Teachers Detail Dashboard",
      },
      {
        url: "/projects/school-management-admin-teachers-delete-prevent.png",
        alt: "School Management Admin Teachers Delete Prevent Dashboard",
      },
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
    ],
    link: "https://school-management-app-psi.vercel.app",
    githubUrl: "https://github.com/fygs/school-management-system",
    stats: {
      stars: 750,
      forks: 35,
      contributors: 1,
      linesOfCode: 3000,
    },
    features: [
      "👧 Student information management",
      "🕰️ Attendance tracking system",
      "🎓 Grade management",
      "📨 Parent communication portal",
      "📊 Administrative dashboard",
    ],
    technicalDetails:
      "Built with Next.js 14 App Router, using Prisma as ORM with PostgreSQL database. Implements real-time updates with WebSocket for attendance and grade notifications.",
    challenges:
      "Implementing a scalable database schema that could handle complex relationships between students, classes, and grades while maintaining optimal performance.",
  },
  {
    id: "plura-saas",
    title: "Plura SaaS App",
    description:
      "A comprehensive SaaS application built with Next.js, TypeScript, Prisma, MySQL, NextAuth, and Stripe, featuring a subscription system, organization and sub-organization creation, sales funnel creation, subdomains, and project management module.",
    image: "/projects/plura-saas.png",
    detailImages: [
      {
        url: "/projects/plura-saas-details.png",
        alt: "Plura SaaS App Overview",
      },
      {
        url: "/projects/plura-saas.png",
        alt: "Plura SaaS App",
      },
    ],
    technologies: ["Next.js", "TypeScript", "Prisma", "MySQL", "Stripe"],
    link: "https://gitlab.com/js-framework-projects/nextjs-projects/plura-saas-app",
    // githubUrl: "https://github.com/fygs/plura-saas",
    stats: {
      stars: 600,
      forks: 40,
      contributors: 1,
      linesOfCode: 20000,
    },
    features: [
      "🤯 Multivendor B2B2B Saas",
      "🏢 Agency and Sub accounts",
      "🌐 Unlimited funnel hosting",
      "🚀 Full Website & Funnel builder",
      "💻 Role-based Access",
      "🔄 Stripe Subscription plans",
      "🛒 Stripe add-on products",
      "🔐 Connect Stripe accounts for all users! - Stripe Connect",
      "💳 Charge application fee per sale and recurring sales",
      "💰 Custom Dashboards",
      "📊 Media Storage",
      "📈 Stripe Product Sync",
      "📌 Custom checkouts on funnels",
      "📢 Get leads from funnels",
      "🎨 Khanban board",
      "📂 Project management system",
      "🔗 Notifications",
      "📆 Funnel performance metrics",
      "🧾 Agency and subacc metrics",
      "🌙 Graphs and charts",
      "☀️ Light & Dark mode",
      "📄 Functioning landing page",
    ],
    technicalDetails:
      "Built with Next.js 14 App Router, implements Stripe for subscription handling, and uses Prisma with MySQL for data management. Features custom subdomain routing and organization management.",
    challenges:
      "Managing complex organization hierarchies and implementing secure subdomain isolation while maintaining scalability and performance.",
  },
  {
    id: "nextauth-v5",
    title: "Next Auth v5 App",
    description:
      "A Next.js application that implements authentication using NextAuth v5, featuring user registration, login, logout functionalities, and Multi-Factor Authentication (MFA) with email code verification.",
    image: "/projects/nextauth-v5.png",
    detailImages: [
      {
        url: "/projects/nextauth-v5-logged-in-admin-only-dashboard.png",
        alt: "Next Auth v5 App Admin Only dashboard",
      },
      {
        url: "/projects/nextauth-v5-logged-in-client-component-dashboard.png",
        alt: "Next Auth v5 App Client Component dashboard",
      },
      {
        url: "/projects/nextauth-v5-logged-in-server-component-dashboard.png",
        alt: "Next Auth v5 App Server Component dashboard",
      },
      {
        url: "/projects/nextauth-v5-logged-in-settings-dashboard.png",
        alt: "Next Auth v5 App Settings dashboard",
      },
      {
        url: "/projects/nextauth-v5-login.png",
        alt: "Next Auth v5 App Login page",
      },
      {
        url: "/projects/nextauth-v5-register-confirmation-email-sent.png",
        alt: "Next Auth v5 App Register Confirmation Email Sent",
      },
      {
        url: "/projects/nextauth-v5-register.png",
        alt: "Next Auth v5 App Register page",
      },
    ],
    technologies: [
      "Next.js 14",
      "NextAuth v5 (Auth.js)",
      "Resend (Email service)",
      "Google Auth",
      "GitHub Auth",
      "Node.js",
      "Shadcn UI",
      "Prisma",
      "PostgreSQL",
      "TailwindCSS",
    ],
    link: "https://gitlab.com/js-framework-projects/nextjs-projects/nextauth-v5-app",
    // githubUrl: "https://github.com/fygs/nextauth-v5-app",
    stats: {
      stars: 300,
      forks: 20,
      contributors: 1,
      linesOfCode: 3000,
    },
    features: [
      "🔐 Next-auth v5 (Auth.js)",
      "🚀 Next.js 14 with server actions",
      "🔑 Credentials Provider",
      "🌐 OAuth Provider (Social login with Google & GitHub)",
      "🔒 Forgot password functionality",
      "✉️ Email verification",
      "📱 Two factor verification (2FA)",
      "👥 User roles (Admin & User)",
      "🔓 Login component (Opens in redirect or modal)",
      "📝 Register component",
      "🤔 Forgot password component",
      "✅ Verification component",
      "⚠️ Error component",
      "🔘 Login button",
      "🚪 Logout button",
      "🚧 Role Gate",
      "🔍 Exploring next.js middleware",
      "📈 Extending & Exploring next-auth session",
      "🔄 Exploring next-auth callbacks",
      "👤 useCurrentUser hook",
      "🛂 useRole hook",
      "🧑 currentUser utility",
      "👮 currentRole utility",
      "🖥️ Example with server component",
      "💻 Example with client component",
      "👑 Render content for admins using RoleGate component",
      "🛡️ Protect API Routes for admins only",
      "🔐 Protect Server Actions for admins only",
      "📧 Change email with new verification in Settings page",
      "🔑 Change password with old password confirmation in Settings page",
      "🔔 Enable/disable two-factor auth in Settings page",
      "🔄 Change user role in Settings page (for development purposes only)",
    ],
    technicalDetails:
      "Implements NextAuth v5 with custom authentication flows, including email verification and MFA. Uses Prisma with PostgreSQL for user data management.",
    challenges:
      "Implementing secure authentication flows while maintaining a smooth user experience, especially for the MFA implementation.",
  },
  {
    id: "js-universe",
    title: "JS Universe Blog",
    description:
      "A high-performance blog platform built with Gatsby and TypeScript, featuring static site generation and smooth progressive image loading, offering a delightful frontend experience with advanced rendering optimization techniques.",
    image: "/projects/js-universe.png",
    detailImages: [
      {
        url: "/projects/js-universe-home.png",
        alt: "JS Universe Blog Homepage",
      },
      {
        url: "/projects/js-universe.png",
        alt: "JS Universe some projects",
      },
      {
        url: "/projects/js-universe-projects.png",
        alt: "JS Universe Projects page",
      },
      {
        url: "/projects/js-universe-projects-detail.png",
        alt: "JS Universe Projects Detail page",
      },
    ],
    technologies: ["Gatsby", "TypeScript", "GraphQL", "TailwindCSS"],
    link: "https://js-universe-blog.netlify.app",
    githubUrl: "https://github.com/fygs/js-universe-blog",
    testimonial: {
      text: "Fernand delivered an exceptional blog platform that exceeded our expectations in terms of performance and user experience.",
      author: "John Doe",
      role: "CTO at TechCorp",
    },
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 700,
    },
    features: [
      "💻 Static Site Generation for optimal performance",
      "📸 Progressive image loading",
      "🔍 SEO optimization",
    ],
    technicalDetails:
      "Built with Gatsby for static site generation, using TypeScript for type safety and GraphQL for efficient data querying. Implemented TailwindCSS for responsive design and custom theming.",
    challenges:
      "Optimizing image loading and implementing efficient caching strategies while maintaining a smooth user experience across different devices and network conditions.",
  },
  {
    id: "idees-kdo",
    title: "Idées KDO",
    description:
      "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords. The app uses advanced natural language processing to understand user preferences and provide personalized gift suggestions.",
    image: "/projects/idees-kdo.png",
    detailImages: [
      {
        url: "/projects/idees-kdo.png",
        alt: "Idées KDO Homepage",
      },
    ],
    technologies: ["Next.js", "OpenAI API", "TailwindCSS", "Vercel AI SDK"],
    link: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
    githubUrl: "https://github.com/fygs/idees-kdo",
    stats: {
      stars: 0,
      forks: 0,
      contributors: 1,
      linesOfCode: 500,
    },
    features: [
      "🎁 AI-powered gift suggestions",
      "👶 Age-based recommendations",
      "🔍 Keyword filtering",
      "🤖 OpenAI integration",
    ],
    technicalDetails:
      "Integrated with OpenAI's GPT model using the Vercel AI SDK for real-time gift suggestions. Implements streaming responses for better user experience.",
    challenges:
      "Fine-tuning the AI prompts to generate relevant and appropriate gift suggestions while maintaining response speed and accuracy.",
  },
];
