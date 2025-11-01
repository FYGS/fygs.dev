import { t, type Dictionary } from "intlayer";

const skillsContent = {
  key: "skills",
  content: {
    badge: t({
      en: "Technical Expertise",
      fr: "Expertise Technique",
      es: "Experiencia Técnica",
    }),
    title: t({
      en: "Skills & Technologies",
      fr: "Compétences & Technologies",
      es: "Habilidades & Tecnologías",
    }),
    description: t({
      en: "A comprehensive overview of my technical expertise across various domains and technologies",
      fr: "Un aperçu complet de mon expertise technique dans divers domaines et technologies",
      es: "Una visión completa de mi experiencia técnica en diversos dominios y tecnologías",
    }),
    skills: [
      {
        id: "react",
        title: "React",
        description: t({
          en: "My go-to library for building dynamic and responsive web applications. I leverage React to create seamless user experiences and efficient component-based architectures.",
          fr: "Ma bibliothèque de référence pour créer des applications web dynamiques et réactives. J'utilise React pour créer des expériences utilisateur fluides et des architectures efficaces basées sur les composants.",
          es: "Mi biblioteca de referencia para construir aplicaciones web dinámicas y responsivas. Aprovecho React para crear experiencias de usuario fluidas y arquitecturas eficientes basadas en componentes.",
        }),
        level: t({
          en: "Expert",
          fr: "Expert",
          es: "Experto",
        }),
        experience: t({
          en: "5+ years",
          fr: "5+ ans",
          es: "5+ años",
        }),
        category: t({
          en: "Frontend",
          fr: "Frontend",
          es: "Frontend",
        }),
      },
      {
        id: "react-query",
        title: "React Query",
        description: t({
          en: "I utilize React Query for advanced data fetching and state management in React applications. It simplifies complex data synchronization tasks and enhances application performance.",
          fr: "J'utilise React Query pour la récupération avancée de données et la gestion d'état dans les applications React. Il simplifie les tâches complexes de synchronisation de données et améliore les performances des applications.",
          es: "Utilizo React Query para la obtención avanzada de datos y gestión de estado en aplicaciones React. Simplifica tareas complejas de sincronización de datos y mejora el rendimiento de las aplicaciones.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "3+ years",
          fr: "3+ ans",
          es: "3+ años",
        }),
        category: t({
          en: "Frontend",
          fr: "Frontend",
          es: "Frontend",
        }),
      },
      {
        id: "nextjs",
        title: "Next.js",
        description: t({
          en: "My preferred framework for building fullstack applications. With Next.js, I create highly optimized and scalable web solutions, leveraging its powerful features like server-side rendering and static site generation.",
          fr: "Mon framework préféré pour créer des applications fullstack. Avec Next.js, je crée des solutions web hautement optimisées et évolutives, en exploitant ses fonctionnalités puissantes comme le rendu côté serveur et la génération de sites statiques.",
          es: "Mi framework preferido para construir aplicaciones fullstack. Con Next.js, creo soluciones web altamente optimizadas y escalables, aprovechando sus potentes características como renderizado del lado del servidor y generación de sitios estáticos.",
        }),
        level: t({
          en: "Expert",
          fr: "Expert",
          es: "Experto",
        }),
        experience: t({
          en: "4+ years",
          fr: "4+ ans",
          es: "4+ años",
        }),
        category: t({
          en: "Fullstack",
          fr: "Fullstack",
          es: "Fullstack",
        }),
      },
      {
        id: "tailwind",
        title: "Tailwind CSS",
        description: t({
          en: "I craft visually appealing and responsive designs using Tailwind CSS. Its utility-first approach allows for rapid development and consistent styling across projects.",
          fr: "Je crée des designs visuellement attrayants et réactifs avec Tailwind CSS. Son approche utility-first permet un développement rapide et un style cohérent dans tous les projets.",
          es: "Creo diseños visualmente atractivos y responsivos usando Tailwind CSS. Su enfoque utility-first permite un desarrollo rápido y un estilo consistente en todos los proyectos.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "4+ years",
          fr: "4+ ans",
          es: "4+ años",
        }),
        category: t({
          en: "Frontend",
          fr: "Frontend",
          es: "Frontend",
        }),
      },
      {
        id: "nodejs",
        title: "Node.js",
        description: t({
          en: "I build scalable and high-performance backend services with Node.js. Its event-driven architecture and extensive ecosystem make it ideal for developing efficient server-side applications.",
          fr: "Je construis des services backend évolutifs et performants avec Node.js. Son architecture événementielle et son écosystème étendu le rendent idéal pour développer des applications serveur efficaces.",
          es: "Construyo servicios backend escalables y de alto rendimiento con Node.js. Su arquitectura basada en eventos y amplio ecosistema lo hacen ideal para desarrollar aplicaciones del lado del servidor eficientes.",
        }),
        level: t({
          en: "Expert",
          fr: "Expert",
          es: "Experto",
        }),
        experience: t({
          en: "5+ years",
          fr: "5+ ans",
          es: "5+ años",
        }),
        category: t({
          en: "Backend",
          fr: "Backend",
          es: "Backend",
        }),
      },
      {
        id: "hono",
        title: "Hono.js",
        description: t({
          en: "I appreciate the simplicity and performance of Hono.js for building web applications. Its lightweight nature and fast routing capabilities make it a great choice for efficient and scalable projects.",
          fr: "J'apprécie la simplicité et les performances de Hono.js pour créer des applications web. Sa nature légère et ses capacités de routage rapides en font un excellent choix pour des projets efficaces et évolutifs.",
          es: "Aprecio la simplicidad y el rendimiento de Hono.js para construir aplicaciones web. Su naturaleza ligera y capacidades de enrutamiento rápido lo hacen una excelente opción para proyectos eficientes y escalables.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "2+ years",
          fr: "2+ ans",
          es: "2+ años",
        }),
        category: t({
          en: "Backend",
          fr: "Backend",
          es: "Backend",
        }),
      },
      {
        id: "ai",
        title: t({
          en: "AI Integration",
          fr: "Intégration IA",
          es: "Integración IA",
        }),
        description: t({
          en: "I integrate advanced AI models into applications, unlocking new possibilities for automation, natural language processing, and intelligent decision-making.",
          fr: "J'intègre des modèles d'IA avancés dans les applications, ouvrant de nouvelles possibilités pour l'automatisation, le traitement du langage naturel et la prise de décision intelligente.",
          es: "Integro modelos avanzados de IA en aplicaciones, desbloqueando nuevas posibilidades para automatización, procesamiento de lenguaje natural y toma de decisiones inteligente.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "3+ years",
          fr: "3+ ans",
          es: "3+ años",
        }),
        category: t({
          en: "AI/ML",
          fr: "IA/ML",
          es: "IA/ML",
        }),
      },
      {
        id: "nestjs",
        title: "Nest.js",
        description: t({
          en: "I develop robust and maintainable backend applications with Nest.js. Its modular architecture and TypeScript support enable the creation of scalable and efficient server-side solutions.",
          fr: "Je développe des applications backend robustes et maintenables avec Nest.js. Son architecture modulaire et son support TypeScript permettent la création de solutions serveur évolutives et efficaces.",
          es: "Desarrollo aplicaciones backend robustas y mantenibles con Nest.js. Su arquitectura modular y soporte TypeScript permiten la creación de soluciones del lado del servidor escalables y eficientes.",
        }),
        level: t({
          en: "Expert",
          fr: "Expert",
          es: "Experto",
        }),
        experience: t({
          en: "4+ years",
          fr: "4+ ans",
          es: "4+ años",
        }),
        category: t({
          en: "Backend",
          fr: "Backend",
          es: "Backend",
        }),
      },
      {
        id: "aws-lambda",
        title: "AWS Lambda",
        description: t({
          en: "I leverage AWS Lambda for building serverless applications, allowing for efficient scaling and cost-effective solutions. Its event-driven architecture is perfect for microservices and automated processing tasks.",
          fr: "J'utilise AWS Lambda pour créer des applications serverless, permettant une mise à l'échelle efficace et des solutions rentables. Son architecture événementielle est parfaite pour les microservices et les tâches de traitement automatisées.",
          es: "Aprovecho AWS Lambda para construir aplicaciones serverless, permitiendo escalado eficiente y soluciones rentables. Su arquitectura basada en eventos es perfecta para microservicios y tareas de procesamiento automatizado.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "3+ years",
          fr: "3+ ans",
          es: "3+ años",
        }),
        category: t({
          en: "Cloud",
          fr: "Cloud",
          es: "Cloud",
        }),
      },
      {
        id: "dynamodb",
        title: "AWS DynamoDB",
        description: t({
          en: "I utilize AWS DynamoDB for its fast and flexible NoSQL database capabilities. It's excellent for applications requiring low-latency data access at any scale. I appreciate its seamless integration with other AWS services and its ability to handle diverse workloads efficiently.",
          fr: "J'utilise AWS DynamoDB pour ses capacités de base de données NoSQL rapides et flexibles. C'est excellent pour les applications nécessitant un accès aux données à faible latence à toute échelle. J'apprécie son intégration transparente avec d'autres services AWS et sa capacité à gérer efficacement diverses charges de travail.",
          es: "Utilizo AWS DynamoDB por sus capacidades rápidas y flexibles de base de datos NoSQL. Es excelente para aplicaciones que requieren acceso a datos de baja latencia a cualquier escala. Aprecio su integración perfecta con otros servicios de AWS y su capacidad para manejar cargas de trabajo diversas eficientemente.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "3+ years",
          fr: "3+ ans",
          es: "3+ años",
        }),
        category: t({
          en: "Cloud",
          fr: "Cloud",
          es: "Cloud",
        }),
      },
      {
        id: "cloudwatch",
        title: "AWS CloudWatch",
        description: t({
          en: "I use AWS CloudWatch for comprehensive monitoring and observability of AWS resources and applications. It provides valuable insights through logs, metrics, and alarms, enabling proactive management and troubleshooting of cloud infrastructure. CloudWatch's real-time monitoring capabilities are crucial for maintaining high availability and performance of AWS-based systems.",
          fr: "J'utilise AWS CloudWatch pour la surveillance complète et l'observabilité des ressources et applications AWS. Il fournit des informations précieuses via les logs, métriques et alarmes, permettant une gestion proactive et un dépannage de l'infrastructure cloud. Les capacités de surveillance en temps réel de CloudWatch sont cruciales pour maintenir la haute disponibilité et les performances des systèmes basés sur AWS.",
          es: "Uso AWS CloudWatch para monitoreo integral y observabilidad de recursos y aplicaciones AWS. Proporciona información valiosa a través de logs, métricas y alarmas, permitiendo gestión proactiva y resolución de problemas de infraestructura cloud. Las capacidades de monitoreo en tiempo real de CloudWatch son cruciales para mantener alta disponibilidad y rendimiento de sistemas basados en AWS.",
        }),
        level: t({
          en: "Intermediate",
          fr: "Intermédiaire",
          es: "Intermedio",
        }),
        experience: t({
          en: "2+ years",
          fr: "2+ ans",
          es: "2+ años",
        }),
        category: t({
          en: "Cloud",
          fr: "Cloud",
          es: "Cloud",
        }),
      },
      {
        id: "sqs",
        title: "AWS SQS",
        description: t({
          en: "I leverage AWS SQS (Simple Queue Service) for building decoupled and scalable microservices architectures. It provides a reliable, highly-scalable, and fully-managed message queuing service that enables asynchronous communication between distributed system components. SQS helps in managing workload spikes, reducing dependencies between services, and ensuring fault tolerance in distributed applications.",
          fr: "J'utilise AWS SQS (Simple Queue Service) pour créer des architectures de microservices découplées et évolutives. Il fournit un service de file d'attente de messages fiable, hautement évolutif et entièrement géré qui permet une communication asynchrone entre les composants système distribués. SQS aide à gérer les pics de charge de travail, réduire les dépendances entre services et garantir la tolérance aux pannes dans les applications distribuées.",
          es: "Aprovecho AWS SQS (Simple Queue Service) para construir arquitecturas de microservicios desacopladas y escalables. Proporciona un servicio de cola de mensajes confiable, altamente escalable y completamente gestionado que permite comunicación asíncrona entre componentes de sistemas distribuidos. SQS ayuda a gestionar picos de carga de trabajo, reducir dependencias entre servicios y garantizar tolerancia a fallos en aplicaciones distribuidas.",
        }),
        level: t({
          en: "Advanced",
          fr: "Avancé",
          es: "Avanzado",
        }),
        experience: t({
          en: "3+ years",
          fr: "3+ ans",
          es: "3+ años",
        }),
        category: t({
          en: "Cloud",
          fr: "Cloud",
          es: "Cloud",
        }),
      },
    ],
  },
} satisfies Dictionary;

export default skillsContent;
