import { t, type Dictionary } from "intlayer";

const cvDataContent = {
  key: "cv-data",
  content: {
    // Common date fields
    present: t({ en: "Present", fr: "Présent", es: "Presente" }),

    // Contract types
    contractTypes: {
      fullTime: t({
        en: "Full-time",
        fr: "CDI / Temps plein",
        es: "Tiempo completo",
      }),
      entrepreneurship: t({
        en: "Entrepreneurship",
        fr: "Entrepreneuriat",
        es: "Emprendimiento",
      }),
      internship: t({
        en: "Internship",
        fr: "Stage",
        es: "Prácticas",
      }),
    },

    // Skill categories
    skillCategories: {
      backend: t({
        en: "Backend Development",
        fr: "Développement Backend",
        es: "Desarrollo Backend",
      }),
      frontend: t({
        en: "Frontend Development",
        fr: "Développement Frontend",
        es: "Desarrollo Frontend",
      }),
      cloud: t({
        en: "Cloud & DevOps",
        fr: "Cloud & DevOps",
        es: "Cloud & DevOps",
      }),
      databases: t({
        en: "Databases & Storage",
        fr: "Bases de données & Stockage",
        es: "Bases de datos & Almacenamiento",
      }),
    },

    // Languages
    spokenLanguages: {
      french: {
        name: t({ en: "French", fr: "Français", es: "Francés" }),
        level: t({ en: "Native", fr: "Natif", es: "Nativo" }),
      },
      english: {
        name: t({ en: "English", fr: "Anglais", es: "Inglés" }),
        level: t({
          en: "Professional",
          fr: "Professionnel",
          es: "Profesional",
        }),
      },
    },

    // Soft skills
    softSkills: {
      leadership: t({
        en: "Technical Leadership",
        fr: "Leadership technique",
        es: "Liderazgo técnico",
      }),
      problemSolving: t({
        en: "Problem Solving",
        fr: "Résolution de problèmes",
        es: "Resolución de problemas",
      }),
      teamwork: t({
        en: "Team Collaboration",
        fr: "Travail en équipe",
        es: "Trabajo en equipo",
      }),
      agile: t({
        en: "Agile Methodologies",
        fr: "Méthodologies agiles",
        es: "Metodologías ágiles",
      }),
      projectManagement: t({
        en: "Project Management",
        fr: "Gestion de projet",
        es: "Gestión de proyectos",
      }),
      clientComm: t({
        en: "Client Communication",
        fr: "Communication client",
        es: "Comunicación con clientes",
      }),
    },

    // Certifications
    certification: {
      validUntil: t({
        en: "Life",
        fr: "À vie",
        es: "De por vida",
      }),
    },

    // Work Preferences
    preferences: {
      title: t({
        en: "Work Preferences",
        fr: "Préférences de travail",
        es: "Preferencias de trabajo",
      }),
      workSchedule: {
        title: t({
          en: "Work Schedule",
          fr: "Rythme de travail",
          es: "Horario de trabajo",
        }),
        detail5days: t({
          en: "Full-time availability for deep project involvement and team collaboration",
          fr: "Disponibilité à temps plein pour une implication profonde dans les projets et la collaboration d'équipe",
          es: "Disponibilidad a tiempo completo para participación profunda en proyectos y colaboración en equipo",
        }),
        detail1to4days: t({
          en: "Flexible part-time schedule for focused consulting and specialized tasks",
          fr: "Emploi du temps flexible à temps partiel pour du conseil ciblé et des tâches spécialisées",
          es: "Horario flexible a tiempo parcial para consultoría enfocada y tareas especializadas",
        }),
      },
      contractDuration: {
        title: t({
          en: "Contract Duration",
          fr: "Durée du contrat",
          es: "Duración del contrato",
        }),
        detailShort: t({
          en: "Short-term projects and quick implementations",
          fr: "Projets à court terme et implémentations rapides",
          es: "Proyectos a corto plazo e implementaciones rápidas",
        }),
        detailLong: t({
          en: "Long-term projects with comprehensive solutions and ongoing development",
          fr: "Projets à long terme avec des solutions complètes et un développement continu",
          es: "Proyectos a largo plazo con soluciones integrales y desarrollo continuo",
        }),
      },
      workEnvironment: {
        title: t({
          en: "Work Environment",
          fr: "Environnement de travail",
          es: "Entorno de trabajo",
        }),
        detailOnsite: t({
          en: "Available for in-office collaboration and team meetings",
          fr: "Disponible pour la collaboration en bureau et les réunions d'équipe",
          es: "Disponible para colaboración en oficina y reuniones de equipo",
        }),
        detailHybrid: t({
          en: "Balanced mix of remote work and office presence for optimal productivity",
          fr: "Mix équilibré entre télétravail et présence en bureau pour une productivité optimale",
          es: "Mix equilibrado entre trabajo remoto y presencia en oficina para una productividad óptima",
        }),
        detailRemote: t({
          en: "Fully equipped for efficient remote collaboration",
          fr: "Entièrement équipé pour une collaboration à distance efficace",
          es: "Completamente equipado para una colaboración remota eficiente",
        }),
      },
      mobility: {
        title: t({
          en: "Mobility",
          fr: "Mobilité",
          es: "Movilidad",
        }),
        detail: t({
          en: "Based in Paris with easy access to all Île-de-France locations",
          fr: "Basé à Paris avec un accès facile à toute l'Île-de-France",
          es: "Ubicado en París con fácil acceso a todas las ubicaciones de Île-de-France",
        }),
      },
      location: {
        title: t({
          en: "Location",
          fr: "Localisation",
          es: "Ubicación",
        }),
        detail: t({
          en: "Centrally located in Paris for easy accessibility and local collaboration",
          fr: "Situé au centre de Paris pour une accessibilité facile et une collaboration locale",
          es: "Ubicado en el centro de París para fácil accesibilidad y colaboración local",
        }),
      },
    },

    // Description section
    description: {
      intro: {
        title: t({
          en: "Senior Software Engineer — Empowering Digital Transformation",
          fr: "Ingénieur Logiciel Senior — Impulser la Transformation Digitale",
          es: "Ingeniero de Software Senior — Impulsando la Transformación Digital",
        }),
        subtitle: t({
          en: "Full-Stack • TypeScript • Next.js • React • Node.js • AWS",
          fr: "Full-Stack • TypeScript • Next.js • React • Node.js • AWS",
          es: "Full-Stack • TypeScript • Next.js • React • Node.js • AWS",
        }),
        mainText: t({
          en: "Bridging innovation and reliability to deliver scalable technical solutions.",
          fr: "Relier l'innovation et la fiabilité pour fournir des solutions techniques évolutives.",
          es: "Conectando la innovación y la confiabilidad para brindar soluciones técnicas escalables.",
        }),
        description: t({
          en: "With over 8 years of diverse industry experience, I specialize in architecting, developing, and deploying modern web applications. My expertise spans across full-stack development, cloud infrastructure, agile methodologies, and corporate technical training. I am passionate about driving digital transformation and building solutions that deliver real, measurable business value.",
          fr: "Avec plus de 8 ans d'expérience dans divers secteurs, je me spécialise dans la conception, le développement et le déploiement d'applications web modernes. Mon expertise couvre le développement full-stack, l'infrastructure cloud, les méthodologies agiles et la formation technique en entreprise. Je suis passionné par la transformation digitale et la création de solutions qui offrent une réelle valeur commerciale mesurable.",
          es: "Con más de 8 años de experiencia en diversos sectores, me especializo en diseñar, desarrollar e implementar aplicaciones web modernas. Mi experiencia abarca desarrollo full-stack, infraestructura en la nube, metodologías ágiles y formación técnica corporativa. Me apasiona impulsar la transformación digital y construir soluciones que brinden un valor empresarial real y medible.",
        }),
      },
      experience: {
        title: t({
          en: "Industry Experience",
          fr: "Expérience Sectorielle",
          es: "Experiencia Sectorial",
        }),
        allianz: {
          company: t({
            en: "Allianz Technology",
            fr: "Allianz Technology",
            es: "Allianz Technology",
          }),
          role: t({
            en: "Global Insurance Platform",
            fr: "Plateforme d'Assurance Internationale",
            es: "Plataforma de Seguros Global",
          }),
        },
        ge: {
          company: t({
            en: "GE Healthcare",
            fr: "GE Healthcare",
            es: "GE Healthcare",
          }),
          role: t({
            en: "Digital Healthcare Solutions",
            fr: "Solutions de Santé Numérique",
            es: "Soluciones de Atención Médica Digital",
          }),
        },
        ouestech: {
          company: t({
            en: "OUESTECH",
            fr: "OUESTECH",
            es: "OUESTECH",
          }),
          role: t({
            en: "Web & Mobile Innovation",
            fr: "Innovation Web & Mobile",
            es: "Innovación Web y Móvil",
          }),
        },
      },
      expertise: {
        title: t({
          en: "Technical Expertise",
          fr: "Expertise Technique",
          es: "Expertise Técnica",
        }),
        react: {
          title: t({
            en: "React / Next.js",
            fr: "React / Next.js",
            es: "React / Next.js",
          }),
          description: t({
            en: "Modern web applications and hybrid platforms",
            fr: "Applications web modernes et plateformes hybrides",
            es: "Aplicaciones web modernas y plataformas híbridas",
          }),
        },
        nodejs: {
          title: t({
            en: "Node.js / NestJS",
            fr: "Node.js / NestJS",
            es: "Node.js / NestJS",
          }),
          description: t({
            en: "RESTful APIs and microservices design",
            fr: "APIs RESTful et conception de microservices",
            es: "APIs RESTful y diseño de microservicios",
          }),
        },
        python: {
          title: t({
            en: "Python / FastAPI",
            fr: "Python / FastAPI",
            es: "Python / FastAPI",
          }),
          description: t({
            en: "High-performance APIs and automation scripts",
            fr: "APIs haute performance et scripts d'automatisation",
            es: "APIs de alto rendimiento y scripts de automatización",
          }),
        },
        cloud: {
          title: t({
            en: "Cloud Architecture",
            fr: "Architecture Cloud",
            es: "Arquitectura en la Nube",
          }),
          description: t({
            en: "Serverless development with AWS services",
            fr: "Développement serverless avec les services AWS",
            es: "Desarrollo serverless con servicios AWS",
          }),
        },
      },
      services: {
        title: t({
          en: "Services Offered",
          fr: "Services Proposés",
          es: "Servicios Ofrecidos",
        }),
        items: {
          webDev: t({
            en: "Custom web application development",
            fr: "Développement d'applications web sur mesure",
            es: "Desarrollo de aplicaciones web personalizadas",
          }),
          modernization: t({
            en: "Technology stack modernization",
            fr: "Modernisation de la pile technologique",
            es: "Modernización de la pila tecnológica",
          }),
          optimization: t({
            en: "Development process optimization",
            fr: "Optimisation des processus de développement",
            es: "Optimización de procesos de desarrollo",
          }),
          cicd: t({
            en: "CI/CD pipeline implementation",
            fr: "Implémentation de pipelines CI/CD",
            es: "Implementación de pipelines CI/CD",
          }),
          api: t({
            en: "API design and development",
            fr: "Conception et développement d'API",
            es: "Diseño y desarrollo de APIs",
          }),
          training: t({
            en: "Technical training and mentoring (Python, TypeScript, Node.js, React)",
            fr: "Formation technique et mentorat (Python, TypeScript, Node.js, React)",
            es: "Formación técnica y mentoría (Python, TypeScript, Node.js, React)",
          }),
          workshops: t({
            en: "Corporate workshops and bootcamps",
            fr: "Ateliers et bootcamps en entreprise",
            es: "Talleres y bootcamps corporativos",
          }),
          support: t({
            en: "Technical support and maintenance",
            fr: "Support technique et maintenance",
            es: "Soporte técnico y mantenimiento",
          }),
        },
      },
      whyMe: {
        title: t({
          en: "Why Choose Me?",
          fr: "Pourquoi Me Choisir ?",
          es: "¿Por Qué Elegirme?",
        }),
        items: {
          expertise: t({
            en: "Deep technical expertise in modern JavaScript technologies",
            fr: "Expertise technique approfondie des technologies JavaScript modernes",
            es: "Profunda experiencia técnica en tecnologías JavaScript modernas",
          }),
          translation: t({
            en: "Ability to translate complex business needs into effective technical solutions",
            fr: "Capacité à traduire des besoins métier complexes en solutions techniques efficaces",
            es: "Capacidad para traducir necesidades empresariales complejas en soluciones técnicas efectivas",
          }),
          results: t({
            en: "Results-oriented approach with strong focus on quality",
            fr: "Approche orientée résultats avec un fort accent sur la qualité",
            es: "Enfoque orientado a resultados con fuerte enfoque en la calidad",
          }),
        },
      },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EXPERIENCES (detailed timeline data)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    experiences: {
      allianz: {
        title: t({
          en: "Backend Developer | Node.js • NestJS • Python • FastAPI • TypeScript • AWS Cloud",
          fr: "Développeur Backend | Node.js • NestJS • Python • FastAPI • TypeScript • AWS Cloud",
          es: "Desarrollador Backend | Node.js • NestJS • Python • FastAPI • TypeScript • AWS Cloud",
        }),
        description: {
          d1: t({
            en: "Design and development of high-performance REST APIs, facilitating seamless integration between Allianz's various systems",
            fr: "Conception et développement d'API REST haute performance, facilitant l'intégration fluide entre les différents systèmes d'Allianz",
            es: "Diseño y desarrollo de API REST de alto rendimiento, facilitando la integración fluida entre los diversos sistemas de Allianz",
          }),
          d2: t({
            en: "Implementation of a microservices architecture, enhancing the scalability and resilience of applications",
            fr: "Mise en place d'une architecture microservices, améliorant la scalabilité et la résilience des applications",
            es: "Implementación de una arquitectura de microservicios, mejorando la escalabilidad y resiliencia de las aplicaciones",
          }),
          d3: t({
            en: "Deployment of serverless solutions, optimizing infrastructure costs and flexibility",
            fr: "Déploiement de solutions serverless, optimisant les coûts d'infrastructure et la flexibilité",
            es: "Despliegue de soluciones serverless, optimizando los costos de infraestructura y la flexibilidad",
          }),
          d4: t({
            en: "Automation of deployment processes through Gitlab CI/CD, accelerating development cycles",
            fr: "Automatisation des processus de déploiement via Gitlab CI/CD, accélérant les cycles de développement",
            es: "Automatización de procesos de despliegue mediante Gitlab CI/CD, acelerando los ciclos de desarrollo",
          }),
          d5: t({
            en: "Utilization of Terraform for Infrastructure as Code, ensuring consistency and reproducibility of environments",
            fr: "Utilisation de Terraform pour l'Infrastructure as Code, assurant la cohérence et la reproductibilité des environnements",
            es: "Utilización de Terraform para Infraestructura como Código, asegurando la consistencia y reproducibilidad de los entornos",
          }),
          d6: t({
            en: "Leveraging AWS services (Lambda, S3, DynamoDB, SQS, CloudWatch) to build robust cloud-native solutions",
            fr: "Exploitation des services AWS (Lambda, S3, DynamoDB, SQS, CloudWatch) pour construire des solutions cloud-native robustes",
            es: "Aprovechamiento de servicios AWS (Lambda, S3, DynamoDB, SQS, CloudWatch) para construir soluciones cloud-native robustas",
          }),
          d7: t({
            en: "Development of high-performance APIs using Python and FastAPI, enabling rapid prototyping and scalable API solutions",
            fr: "Développement d'API haute performance utilisant Python et FastAPI, permettant un prototypage rapide et des solutions API scalables",
            es: "Desarrollo de API de alto rendimiento usando Python y FastAPI, permitiendo prototipado rápido y soluciones API escalables",
          }),
        },
        achievements: {
          a1: t({
            en: "Reduced client request processing time by 30%",
            fr: "Réduction du temps de traitement des requêtes clients de 30%",
            es: "Reducción del tiempo de procesamiento de solicitudes en un 30%",
          }),
          a2: t({
            en: "Improved system stability by 25% during peak loads",
            fr: "Amélioration de la stabilité du système de 25% lors des pics de charge",
            es: "Mejora de la estabilidad del sistema en un 25% durante picos de carga",
          }),
          a3: t({
            en: "Decreased infrastructure costs by 20% through cloud optimization",
            fr: "Diminution des coûts d'infrastructure de 20% grâce à l'optimisation cloud",
            es: "Reducción de costos de infraestructura en un 20% mediante optimización cloud",
          }),
          a4: t({
            en: "Enhanced system security and compliance by implementing cloud-based NFRs",
            fr: "Renforcement de la sécurité et de la conformité via des exigences non fonctionnelles cloud",
            es: "Mejora de la seguridad y cumplimiento mediante requisitos no funcionales basados en la nube",
          }),
        },
        context: t({
          en: "Allianz Technology, the technology subsidiary of the Allianz Group, is at the forefront of innovation in the insurance and financial services sector. The company develops cutting-edge digital solutions to enhance customer experience and optimize the group's internal processes. With a presence in over 70 countries and serving millions of customers, Allianz Technology plays a crucial role in the digital transformation of the insurance giant.\n\nI joined Allianz Technology in 2023 as a Backend Developer, contributing to the development and improvement of the core systems that power the group's insurance services. My role is essential in creating a robust and scalable infrastructure capable of meeting the growing needs of a global clientele.",
          fr: "Allianz Technology, filiale technologique du groupe Allianz, est à la pointe de l'innovation dans le secteur de l'assurance et des services financiers. L'entreprise développe des solutions numériques de pointe pour améliorer l'expérience client et optimiser les processus internes du groupe. Avec une présence dans plus de 70 pays et des millions de clients, Allianz Technology joue un rôle crucial dans la transformation digitale du géant de l'assurance.\n\nJ'ai rejoint Allianz Technology en 2023 en tant que Développeur Backend, contribuant au développement et à l'amélioration des systèmes centraux qui alimentent les services d'assurance du groupe. Mon rôle est essentiel dans la création d'une infrastructure robuste et scalable capable de répondre aux besoins croissants d'une clientèle mondiale.",
          es: "Allianz Technology, la filial tecnológica del Grupo Allianz, está a la vanguardia de la innovación en el sector de seguros y servicios financieros. La empresa desarrolla soluciones digitales de vanguardia para mejorar la experiencia del cliente y optimizar los procesos internos del grupo. Con presencia en más de 70 países y sirviendo a millones de clientes, Allianz Technology desempeña un papel crucial en la transformación digital del gigante asegurador.\n\nMe uní a Allianz Technology en 2023 como Desarrollador Backend, contribuyendo al desarrollo y mejora de los sistemas centrales que impulsan los servicios de seguros del grupo. Mi rol es esencial en la creación de una infraestructura robusta y escalable capaz de satisfacer las crecientes necesidades de una clientela global.",
        }),
      },

      ouestech: {
        title: t({
          en: "Full Stack Software Engineer | React, NextJS, TypeScript, Node.js",
          fr: "Ingénieur Logiciel Full Stack | React, NextJS, TypeScript, Node.js",
          es: "Ingeniero de Software Full Stack | React, NextJS, TypeScript, Node.js",
        }),
        description: {
          d1: t({
            en: "Developing and maintaining scalable web applications for various clients",
            fr: "Développement et maintenance d'applications web scalables pour divers clients",
            es: "Desarrollo y mantenimiento de aplicaciones web escalables para diversos clientes",
          }),
          d2: t({
            en: "Leading technical architecture decisions and implementation strategies",
            fr: "Direction des décisions d'architecture technique et des stratégies d'implémentation",
            es: "Liderazgo en decisiones de arquitectura técnica y estrategias de implementación",
          }),
          d3: t({
            en: "Collaborating with clients to define project requirements and timelines",
            fr: "Collaboration avec les clients pour définir les exigences et les calendriers de projet",
            es: "Colaboración con clientes para definir requisitos y cronogramas de proyectos",
          }),
          d4: t({
            en: "Ensuring high code quality and performance optimization",
            fr: "Garantie de la qualité du code et optimisation des performances",
            es: "Aseguramiento de la calidad del código y optimización del rendimiento",
          }),
          d5: t({
            en: "Managing entire development lifecycle from conception to deployment",
            fr: "Gestion du cycle de développement complet, de la conception au déploiement",
            es: "Gestión del ciclo de desarrollo completo, desde la concepción hasta el despliegue",
          }),
          d6: t({
            en: "Implementing responsive and accessible user interfaces",
            fr: "Implémentation d'interfaces utilisateur responsives et accessibles",
            es: "Implementación de interfaces de usuario responsivas y accesibles",
          }),
          d7: t({
            en: "Delivering technical training sessions in Python, TypeScript, Node.js, and React",
            fr: "Animation de sessions de formation technique en Python, TypeScript, Node.js et React",
            es: "Impartición de sesiones de formación técnica en Python, TypeScript, Node.js y React",
          }),
          d8: t({
            en: "Mentoring junior developers and conducting code reviews",
            fr: "Mentorat de développeurs juniors et revues de code",
            es: "Mentoría de desarrolladores junior y revisiones de código",
          }),
        },
        achievements: {
          a1: t({
            en: "Successfully delivered 15+ projects for diverse clients",
            fr: "Livraison réussie de plus de 15 projets pour des clients variés",
            es: "Entrega exitosa de más de 15 proyectos para clientes diversos",
          }),
          a2: t({
            en: "Achieved 98% client satisfaction rate",
            fr: "Taux de satisfaction client de 98%",
            es: "Tasa de satisfacción del cliente del 98%",
          }),
          a3: t({
            en: "Reduced average page load time by 60%",
            fr: "Réduction du temps de chargement moyen des pages de 60%",
            es: "Reducción del tiempo de carga promedio de páginas en un 60%",
          }),
          a4: t({
            en: "Implemented automated testing increasing code coverage to 90%",
            fr: "Mise en place de tests automatisés augmentant la couverture de code à 90%",
            es: "Implementación de pruebas automatizadas aumentando la cobertura de código al 90%",
          }),
          a5: t({
            en: "Trained 50+ developers across multiple corporate workshops",
            fr: "Formation de plus de 50 développeurs lors de plusieurs ateliers en entreprise",
            es: "Formación de más de 50 desarrolladores en múltiples talleres corporativos",
          }),
        },
        context: t({
          en: "As co-founder and lead developer of Ouestech, I have the opportunity to work on a variety of exciting projects across different sectors. This experience has allowed me to develop strong adaptability and deep expertise in modern web technologies.\n\nMy partner and I handle the entire development lifecycle, from design to production, including development and deployment. Beyond development, I also deliver technical training workshops and bootcamps for corporate teams on modern web technologies and Python development. This position has enabled me to develop not only my technical skills but also my project management, client communication, and teaching abilities.",
          fr: "En tant que co-fondateur et développeur principal d'Ouestech, j'ai l'opportunité de travailler sur une variété de projets passionnants dans différents secteurs. Cette expérience m'a permis de développer une forte adaptabilité et une expertise approfondie dans les technologies web modernes.\n\nMon associé et moi gérons le cycle de développement complet, de la conception à la production. Au-delà du développement, je propose également des formations techniques et des bootcamps pour les équipes en entreprise sur les technologies web modernes et le développement Python. Ce poste m'a permis de développer non seulement mes compétences techniques mais aussi mes capacités en gestion de projet, communication client et enseignement.",
          es: "Como cofundador y desarrollador principal de Ouestech, tengo la oportunidad de trabajar en una variedad de proyectos emocionantes en diferentes sectores. Esta experiencia me ha permitido desarrollar una fuerte adaptabilidad y una profunda experiencia en tecnologías web modernas.\n\nMi socio y yo gestionamos el ciclo de desarrollo completo, desde el diseño hasta la producción. Más allá del desarrollo, también imparto talleres de formación técnica y bootcamps para equipos corporativos sobre tecnologías web modernas y desarrollo en Python. Esta posición me ha permitido desarrollar no solo mis habilidades técnicas sino también mis capacidades en gestión de proyectos, comunicación con clientes y enseñanza.",
        }),
      },

      geHealthcare1: {
        title: t({
          en: "Software Engineer | TypeScript, Node.js Developer",
          fr: "Ingénieur Logiciel | Développeur TypeScript, Node.js",
          es: "Ingeniero de Software | Desarrollador TypeScript, Node.js",
        }),
        description: {
          d1: t({
            en: "Development of a Web SDK for medical imaging, enabling advanced visualization capabilities for healthcare professionals",
            fr: "Développement d'un SDK Web pour l'imagerie médicale, offrant des capacités de visualisation avancées aux professionnels de santé",
            es: "Desarrollo de un SDK Web para imagen médica, proporcionando capacidades avanzadas de visualización a profesionales de la salud",
          }),
          d2: t({
            en: "Design and implementation of Micro Front-End components, enhancing the platform's modularity and scalability",
            fr: "Conception et implémentation de composants Micro Front-End, améliorant la modularité et la scalabilité de la plateforme",
            es: "Diseño e implementación de componentes Micro Front-End, mejorando la modularidad y escalabilidad de la plataforma",
          }),
          d3: t({
            en: "Close collaboration with software architects and UX/UI teams to ensure optimal design and seamless user experience",
            fr: "Collaboration étroite avec les architectes logiciels et les équipes UX/UI pour garantir un design optimal et une expérience utilisateur fluide",
            es: "Colaboración estrecha con arquitectos de software y equipos UX/UI para garantizar un diseño óptimo y una experiencia de usuario fluida",
          }),
          d4: t({
            en: "Writing comprehensive software specifications, ensuring clear communication of technical requirements",
            fr: "Rédaction de spécifications logicielles complètes, assurant une communication claire des exigences techniques",
            es: "Redacción de especificaciones de software completas, asegurando una comunicación clara de los requisitos técnicos",
          }),
          d5: t({
            en: "Establishment of rigorous testing strategies, including unit tests, component tests, and End-to-End (E2E) tests, to maintain high software quality",
            fr: "Mise en place de stratégies de test rigoureuses, incluant tests unitaires, tests de composants et tests E2E, pour maintenir une haute qualité logicielle",
            es: "Establecimiento de estrategias de prueba rigurosas, incluyendo pruebas unitarias, de componentes y End-to-End (E2E), para mantener una alta calidad del software",
          }),
          d6: t({
            en: "Orchestration of continuous integration processes via GitLab and Jenkins, streamlining development workflows",
            fr: "Orchestration des processus d'intégration continue via GitLab et Jenkins, optimisant les workflows de développement",
            es: "Orquestación de procesos de integración continua mediante GitLab y Jenkins, optimizando los flujos de trabajo de desarrollo",
          }),
          d7: t({
            en: "Utilization of Sonar for code quality assurance, maintaining high standards of code cleanliness and efficiency",
            fr: "Utilisation de Sonar pour l'assurance qualité du code, maintenant des standards élevés de propreté et d'efficacité",
            es: "Utilización de Sonar para la garantía de calidad del código, manteniendo altos estándares de limpieza y eficiencia",
          }),
        },
        achievements: {
          a1: t({
            en: "Contributed to the development of the SDK",
            fr: "Contribution au développement du SDK",
            es: "Contribución al desarrollo del SDK",
          }),
          a2: t({
            en: "Implemented new front-end components for domain-specific applications sold to hospitals",
            fr: "Implémentation de nouveaux composants front-end pour des applications spécialisées vendues aux hôpitaux",
            es: "Implementación de nuevos componentes front-end para aplicaciones especializadas vendidas a hospitales",
          }),
          a3: t({
            en: "Maintained and stabilized tests",
            fr: "Maintenance et stabilisation des tests",
            es: "Mantenimiento y estabilización de pruebas",
          }),
        },
        context: t({
          en: "GE Healthcare, a global leader in medical technology and digital solutions, is at the forefront of innovation in medical imaging and diagnosis. The company develops cutting-edge solutions that enable healthcare professionals to provide faster and more accurate diagnoses, thereby improving patient outcomes.\n\nI joined GE Healthcare in 2019 as a Software Developer, contributing to the development of Web Front-end and the improvement of the Imaging Fabric (IF) project — a Web SDK for advanced medical imaging visualization.",
          fr: "GE Healthcare, leader mondial de la technologie médicale et des solutions numériques, est à la pointe de l'innovation en imagerie médicale et diagnostic. L'entreprise développe des solutions de pointe permettant aux professionnels de santé de fournir des diagnostics plus rapides et plus précis, améliorant ainsi les résultats pour les patients.\n\nJ'ai rejoint GE Healthcare en 2019 en tant que Développeur Logiciel, contribuant au développement du Front-end Web et à l'amélioration du projet Imaging Fabric (IF) — un SDK Web pour la visualisation avancée d'imagerie médicale.",
          es: "GE Healthcare, líder mundial en tecnología médica y soluciones digitales, está a la vanguardia de la innovación en imagen médica y diagnóstico. La empresa desarrolla soluciones de vanguardia que permiten a los profesionales de la salud proporcionar diagnósticos más rápidos y precisos, mejorando así los resultados para los pacientes.\n\nMe uní a GE Healthcare en 2019 como Desarrollador de Software, contribuyendo al desarrollo del Front-end Web y la mejora del proyecto Imaging Fabric (IF) — un SDK Web para visualización avanzada de imagen médica.",
        }),
      },

      geHealthcare2: {
        title: t({
          en: "Software Engineer | Full Stack Developer",
          fr: "Ingénieur Logiciel | Développeur Full Stack",
          es: "Ingeniero de Software | Desarrollador Full Stack",
        }),
        description: {
          d1: t({
            en: "Contributed to the development of a 3D medical image viewer, enhancing clinical workflow applications for healthcare professionals",
            fr: "Contribution au développement d'un visualiseur d'images médicales 3D, améliorant les applications de workflow clinique pour les professionnels de santé",
            es: "Contribución al desarrollo de un visor de imágenes médicas 3D, mejorando las aplicaciones de flujo de trabajo clínico para profesionales de la salud",
          }),
          d2: t({
            en: "Worked in a multi-platform environment (Linux - CentOS, Windows) to ensure compatibility and performance",
            fr: "Travail dans un environnement multi-plateforme (Linux - CentOS, Windows) pour assurer la compatibilité et les performances",
            es: "Trabajo en un entorno multiplataforma (Linux - CentOS, Windows) para asegurar la compatibilidad y el rendimiento",
          }),
          d3: t({
            en: "Collaborated within an Agile/Scrum framework to deliver high-quality software solutions efficiently",
            fr: "Collaboration au sein d'un cadre Agile/Scrum pour livrer des solutions logicielles de haute qualité de manière efficace",
            es: "Colaboración dentro de un marco Agile/Scrum para entregar soluciones de software de alta calidad de manera eficiente",
          }),
          d4: t({
            en: "Interacted with software architects to design system interactions optimizing user experience",
            fr: "Interaction avec les architectes logiciels pour concevoir des interactions système optimisant l'expérience utilisateur",
            es: "Interacción con arquitectos de software para diseñar interacciones del sistema optimizando la experiencia del usuario",
          }),
          d5: t({
            en: "Wrote comprehensive software specifications to ensure clear communication of technical requirements",
            fr: "Rédaction de spécifications logicielles complètes pour assurer une communication claire des exigences techniques",
            es: "Redacción de especificaciones de software completas para asegurar una comunicación clara de los requisitos técnicos",
          }),
          d6: t({
            en: "Implemented rigorous testing strategies, including unit tests and integration tests, to maintain high software quality",
            fr: "Mise en place de stratégies de test rigoureuses, incluant tests unitaires et tests d'intégration, pour maintenir une haute qualité logicielle",
            es: "Implementación de estrategias de prueba rigurosas, incluyendo pruebas unitarias y de integración, para mantener una alta calidad del software",
          }),
          d7: t({
            en: "Contributed to continuous integration processes, ensuring streamlined development workflows",
            fr: "Contribution aux processus d'intégration continue, assurant des workflows de développement optimisés",
            es: "Contribución a los procesos de integración continua, asegurando flujos de trabajo de desarrollo optimizados",
          }),
        },
        achievements: {
          a1: t({
            en: "Contributed to the Technical Design Reviews",
            fr: "Contribution aux revues de conception technique",
            es: "Contribución a las revisiones de diseño técnico",
          }),
          a2: t({
            en: "Developed an advanced GSA material management component",
            fr: "Développement d'un composant avancé de gestion de matériaux GSA",
            es: "Desarrollo de un componente avanzado de gestión de materiales GSA",
          }),
          a3: t({
            en: "Maintained and fixed bugs",
            fr: "Maintenance et correction de bugs",
            es: "Mantenimiento y corrección de errores",
          }),
        },
        context: t({
          en: "I joined GE Healthcare in 2019 as a Full-stack Software Developer, contributing to the development and improvement of the Advantage Workstation (AW) project — a 3D medical image viewer designed for advanced clinical workflows. My role was crucial in the team for a robust and evolving platform.",
          fr: "J'ai rejoint GE Healthcare en 2019 en tant que Développeur Logiciel Full-stack, contribuant au développement et à l'amélioration du projet Advantage Workstation (AW) — un visualiseur d'images médicales 3D conçu pour des workflows cliniques avancés. Mon rôle était crucial au sein de l'équipe pour une plateforme robuste et en constante évolution.",
          es: "Me uní a GE Healthcare en 2019 como Desarrollador de Software Full-stack, contribuyendo al desarrollo y mejora del proyecto Advantage Workstation (AW) — un visor de imágenes médicas 3D diseñado para flujos de trabajo clínicos avanzados. Mi rol fue crucial en el equipo para una plataforma robusta y en constante evolución.",
        }),
      },

      schneider: {
        title: t({
          en: "Software Engineer | Full Stack Developer",
          fr: "Ingénieur Logiciel | Développeur Full Stack",
          es: "Ingeniero de Software | Desarrollador Full Stack",
        }),
        description: {
          d1: t({
            en: "Designed and implemented an evolving backend system interacting with hardware components, including a TCP/IP gateway and Zigbee wireless sensors",
            fr: "Conception et implémentation d'un système backend évolutif interagissant avec des composants matériels, incluant une passerelle TCP/IP et des capteurs sans fil Zigbee",
            es: "Diseño e implementación de un sistema backend evolutivo interactuando con componentes de hardware, incluyendo una pasarela TCP/IP y sensores inalámbricos Zigbee",
          }),
          d2: t({
            en: "Developed an intuitive frontend interface with reactive user interfaces for system configuration and real-time visualization of vibration data",
            fr: "Développement d'une interface frontend intuitive avec des interfaces utilisateur réactives pour la configuration et la visualisation en temps réel des données de vibration",
            es: "Desarrollo de una interfaz frontend intuitiva con interfaces de usuario reactivas para la configuración y visualización en tiempo real de datos de vibración",
          }),
          d3: t({
            en: "Designed a modular software architecture, ensuring scalability and ease of maintenance",
            fr: "Conception d'une architecture logicielle modulaire, assurant la scalabilité et la facilité de maintenance",
            es: "Diseño de una arquitectura de software modular, asegurando la escalabilidad y facilidad de mantenimiento",
          }),
          d4: t({
            en: "Wrote detailed software specifications and closely collaborated with HW/SW architecture teams",
            fr: "Rédaction de spécifications logicielles détaillées et collaboration étroite avec les équipes d'architecture HW/SW",
            es: "Redacción de especificaciones de software detalladas y colaboración estrecha con equipos de arquitectura HW/SW",
          }),
          d5: t({
            en: "Utilized WebSocket technology to establish bidirectional communication between backend and user interfaces, enabling real-time data exchange",
            fr: "Utilisation de la technologie WebSocket pour établir une communication bidirectionnelle entre le backend et les interfaces utilisateur, permettant l'échange de données en temps réel",
            es: "Utilización de la tecnología WebSocket para establecer comunicación bidireccional entre el backend y las interfaces de usuario, permitiendo el intercambio de datos en tiempo real",
          }),
          d6: t({
            en: "Conducted thorough testing, adhering to Schneider Electric's high quality standards",
            fr: "Réalisation de tests approfondis, respectant les standards de qualité élevés de Schneider Electric",
            es: "Realización de pruebas exhaustivas, adhiriéndose a los altos estándares de calidad de Schneider Electric",
          }),
          d7: t({
            en: "Produced comprehensive technical documentation, facilitating knowledge transfer and future system maintenance",
            fr: "Production d'une documentation technique complète, facilitant le transfert de connaissances et la maintenance future du système",
            es: "Producción de documentación técnica completa, facilitando la transferencia de conocimientos y el mantenimiento futuro del sistema",
          }),
        },
        achievements: {
          a1: t({
            en: "Designed and developed a machine failure monitoring system leveraging sensor technology",
            fr: "Conception et développement d'un système de surveillance des défaillances machines exploitant la technologie des capteurs",
            es: "Diseño y desarrollo de un sistema de monitoreo de fallas de máquinas aprovechando la tecnología de sensores",
          }),
          a2: t({
            en: "Developed an intuitive real-time data monitoring interface for enhanced system visibility",
            fr: "Développement d'une interface intuitive de surveillance de données en temps réel pour une meilleure visibilité du système",
            es: "Desarrollo de una interfaz intuitiva de monitoreo de datos en tiempo real para una mejor visibilidad del sistema",
          }),
          a3: t({
            en: "Delivered comprehensive project documentation and deliverables",
            fr: "Livraison d'une documentation de projet complète et des livrables",
            es: "Entrega de documentación de proyecto completa y entregables",
          }),
        },
        context: t({
          en: "As part of my final year project (BAC+5), I joined Schneider Electric's R&D team to develop an innovative solution for managing wireless vibration sensors. This project was crucial in Schneider's efforts to expand its offerings in the Industrial Internet of Things (IIoT) and improve predictive maintenance capabilities for its industrial clients.",
          fr: "Dans le cadre de mon projet de fin d'études (BAC+5), j'ai rejoint l'équipe R&D de Schneider Electric pour développer une solution innovante de gestion de capteurs de vibration sans fil. Ce projet était crucial dans les efforts de Schneider pour étendre son offre dans l'Internet des Objets Industriel (IIoT) et améliorer les capacités de maintenance prédictive pour ses clients industriels.",
          es: "Como parte de mi proyecto de fin de estudios (BAC+5), me uní al equipo de I+D de Schneider Electric para desarrollar una solución innovadora de gestión de sensores de vibración inalámbricos. Este proyecto fue crucial en los esfuerzos de Schneider por expandir su oferta en el Internet de las Cosas Industrial (IIoT) y mejorar las capacidades de mantenimiento predictivo para sus clientes industriales.",
        }),
      },

      atlanSpace: {
        title: t({
          en: "Software Engineer",
          fr: "Ingénieur Logiciel",
          es: "Ingeniero de Software",
        }),
        description: {
          d1: t({
            en: "Conducted mechanical, aerodynamic, telecom, and energy studies to optimize the drone's performance and efficiency",
            fr: "Réalisation d'études mécaniques, aérodynamiques, télécom et énergétiques pour optimiser les performances et l'efficacité du drone",
            es: "Realización de estudios mecánicos, aerodinámicos, de telecomunicaciones y energéticos para optimizar el rendimiento y eficiencia del dron",
          }),
          d2: t({
            en: "Designed and fabricated custom electronic circuits and mechanical components, ensuring seamless integration of all subsystems",
            fr: "Conception et fabrication de circuits électroniques et de composants mécaniques sur mesure, assurant l'intégration harmonieuse de tous les sous-systèmes",
            es: "Diseño y fabricación de circuitos electrónicos y componentes mecánicos personalizados, asegurando la integración fluida de todos los subsistemas",
          }),
          d3: t({
            en: "Implemented the drone's vision capabilities using the OpenCV library in C++ on Raspberry Pi 3, enhancing autonomous navigation and object recognition",
            fr: "Implémentation des capacités de vision du drone à l'aide de la bibliothèque OpenCV en C++ sur Raspberry Pi 3, améliorant la navigation autonome et la reconnaissance d'objets",
            es: "Implementación de las capacidades de visión del dron utilizando la biblioteca OpenCV en C++ en Raspberry Pi 3, mejorando la navegación autónoma y el reconocimiento de objetos",
          }),
          d4: t({
            en: "Developed an intuitive interface for the ground control station using Qt4, facilitating operator interaction and mission management",
            fr: "Développement d'une interface intuitive pour la station de contrôle au sol à l'aide de Qt4, facilitant l'interaction opérateur et la gestion de mission",
            es: "Desarrollo de una interfaz intuitiva para la estación de control terrestre usando Qt4, facilitando la interacción del operador y la gestión de misiones",
          }),
          d5: t({
            en: "Programmed embedded systems in C++ and Python on Raspberry Pi, optimizing processing and control algorithms",
            fr: "Programmation de systèmes embarqués en C++ et Python sur Raspberry Pi, optimisant les algorithmes de traitement et de contrôle",
            es: "Programación de sistemas embebidos en C++ y Python en Raspberry Pi, optimizando algoritmos de procesamiento y control",
          }),
          d6: t({
            en: "Assembled and conducted rigorous testing of the fixed-wing drone prototype, validating design concepts and system performance",
            fr: "Assemblage et tests rigoureux du prototype de drone à voilure fixe, validant les concepts de conception et les performances du système",
            es: "Ensamblaje y pruebas rigurosas del prototipo de dron de ala fija, validando los conceptos de diseño y el rendimiento del sistema",
          }),
          d7: t({
            en: "Collaborated closely with aeronautics researchers to integrate advanced technologies into the drone platform",
            fr: "Collaboration étroite avec des chercheurs en aéronautique pour intégrer des technologies avancées dans la plateforme drone",
            es: "Colaboración estrecha con investigadores en aeronáutica para integrar tecnologías avanzadas en la plataforma del dron",
          }),
        },
        achievements: {
          a1: t({
            en: "Developed a fixed-wing drone with advanced aerodynamic capabilities",
            fr: "Développement d'un drone à voilure fixe avec des capacités aérodynamiques avancées",
            es: "Desarrollo de un dron de ala fija con capacidades aerodinámicas avanzadas",
          }),
          a2: t({
            en: "Implemented computer vision for the drone using OpenCV in Python, enabling real-time object detection and tracking",
            fr: "Implémentation de la vision par ordinateur pour le drone à l'aide d'OpenCV en Python, permettant la détection et le suivi d'objets en temps réel",
            es: "Implementación de visión por computadora para el dron usando OpenCV en Python, permitiendo la detección y seguimiento de objetos en tiempo real",
          }),
          a3: t({
            en: "Designed and developed a robust monitoring and orchestration interface in C++/Qt, facilitating seamless control and navigation",
            fr: "Conception et développement d'une interface robuste de surveillance et d'orchestration en C++/Qt, facilitant le contrôle et la navigation fluides",
            es: "Diseño y desarrollo de una interfaz robusta de monitoreo y orquestación en C++/Qt, facilitando el control y navegación fluidos",
          }),
        },
        context: t({
          en: "As part of my final year project in engineering school, I collaborated with Atlan Space and an aeronautical research laboratory to design and develop an innovative system for fixed-wing unmanned aerial vehicles (UAVs). I led the complete development of a fixed-wing drone prototype, from conceptual design to flight testing, integrating advanced computer vision capabilities.",
          fr: "Dans le cadre de mon projet de fin d'études en école d'ingénieurs, j'ai collaboré avec Atlan Space et un laboratoire de recherche aéronautique pour concevoir et développer un système innovant pour les véhicules aériens sans pilote (UAV) à voilure fixe. J'ai dirigé le développement complet d'un prototype de drone à voilure fixe, de la conception au test en vol, intégrant des capacités avancées de vision par ordinateur.",
          es: "Como parte de mi proyecto de fin de estudios en la escuela de ingeniería, colaboré con Atlan Space y un laboratorio de investigación aeronáutica para diseñar y desarrollar un sistema innovador para vehículos aéreos no tripulados (UAV) de ala fija. Lideré el desarrollo completo de un prototipo de dron de ala fija, desde el diseño conceptual hasta las pruebas de vuelo, integrando capacidades avanzadas de visión por computadora.",
        }),
      },
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EDUCATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    education: {
      sorbonne: {
        title: t({
          en: "Master's Degree in Computer Science",
          fr: "Master en Informatique",
          es: "Máster en Informática",
        }),
        description: {
          d1: t({
            en: "Specialization in Software Engineering and Electronic Engineering",
            fr: "Spécialisation en Ingénierie Logicielle et Ingénierie Électronique",
            es: "Especialización en Ingeniería de Software e Ingeniería Electrónica",
          }),
          d2: t({
            en: "Advanced coursework in Distributed Systems and Network Architecture",
            fr: "Cours avancés en Systèmes Distribués et Architecture Réseau",
            es: "Cursos avanzados en Sistemas Distribuidos y Arquitectura de Redes",
          }),
          d3: t({
            en: "Master's program at the intersection of electronics and computer science, focusing on the study, design, and development of complex systems with multi-sector versatility and adaptability",
            fr: "Programme de Master à l'intersection de l'électronique et de l'informatique, axé sur l'étude, la conception et le développement de systèmes complexes avec polyvalence et adaptabilité multi-secteurs",
            es: "Programa de Máster en la intersección de la electrónica y la informática, enfocado en el estudio, diseño y desarrollo de sistemas complejos con versatilidad y adaptabilidad multisectorial",
          }),
          d4: t({
            en: "Providing a solid foundation for various career paths, including embedded systems development and software development",
            fr: "Fournissant une base solide pour divers parcours professionnels, incluant le développement de systèmes embarqués et le développement logiciel",
            es: "Proporcionando una base sólida para diversas trayectorias profesionales, incluyendo el desarrollo de sistemas embebidos y el desarrollo de software",
          }),
        },
        achievements: {
          a1: t({
            en: "Graduated with a Master's Degree in Science",
            fr: "Diplômé d'un Master en Sciences",
            es: "Graduado con un Máster en Ciencias",
          }),
          a2: t({
            en: "Object-oriented C++ programming — Object modeling of a data structure",
            fr: "Programmation C++ orientée objet — Modélisation objet d'une structure de données",
            es: "Programación C++ orientada a objetos — Modelado de objetos de una estructura de datos",
          }),
          a3: t({
            en: "Successfully defended my final year project",
            fr: "Soutenance réussie de mon projet de fin d'études",
            es: "Defensa exitosa de mi proyecto de fin de estudios",
          }),
        },
      },

      upmc: {
        title: t({
          en: "Master's Degree in Computer Science",
          fr: "Master en Informatique",
          es: "Máster en Informática",
        }),
        description: {
          d1: t({
            en: "Study of Electronic Systems and Computer Systems",
            fr: "Étude des Systèmes Électroniques et des Systèmes Informatiques",
            es: "Estudio de Sistemas Electrónicos y Sistemas Informáticos",
          }),
          d2: t({
            en: "Embedded systems",
            fr: "Systèmes embarqués",
            es: "Sistemas embebidos",
          }),
          d3: t({
            en: "Computer Engineering: Web languages, C, C++, Python, ...",
            fr: "Ingénierie Informatique : Langages web, C, C++, Python, ...",
            es: "Ingeniería Informática: Lenguajes web, C, C++, Python, ...",
          }),
          d4: t({
            en: "Electronic Engineering: VHDL, C, C++, assembler on FPGA and DSP",
            fr: "Ingénierie Électronique : VHDL, C, C++, assembleur sur FPGA et DSP",
            es: "Ingeniería Electrónica: VHDL, C, C++, ensamblador en FPGA y DSP",
          }),
        },
        achievements: {
          a1: t({
            en: "Admitted to Master's program second year",
            fr: "Admis en deuxième année de Master",
            es: "Admitido en el segundo año de Máster",
          }),
          a2: t({
            en: "Programming of digital systems — Implementation of a DCC central unit on FPGA",
            fr: "Programmation de systèmes numériques — Implémentation d'une centrale DCC sur FPGA",
            es: "Programación de sistemas digitales — Implementación de una unidad central DCC en FPGA",
          }),
          a3: t({
            en: "Development on DSP target — Image processing, contour detection by convolution mask applications",
            fr: "Développement sur cible DSP — Traitement d'images, détection de contours par applications de masques de convolution",
            es: "Desarrollo en objetivo DSP — Procesamiento de imágenes, detección de contornos mediante aplicaciones de máscaras de convolución",
          }),
          a4: t({
            en: "Peripheral programming — Wireless communication Raspberry/Arduino by NRF",
            fr: "Programmation de périphériques — Communication sans fil Raspberry/Arduino par NRF",
            es: "Programación de periféricos — Comunicación inalámbrica Raspberry/Arduino por NRF",
          }),
        },
      },

      ensa: {
        title: t({
          en: "Engineering Degree in Computer Science",
          fr: "Diplôme d'Ingénieur en Informatique",
          es: "Título de Ingeniería en Informática",
        }),
        description: {
          d1: t({
            en: "Engineering school with 2 years of integrated preparatory classes and a 3-year specialization",
            fr: "École d'ingénieurs avec 2 ans de classes préparatoires intégrées et 3 ans de spécialisation",
            es: "Escuela de ingeniería con 2 años de clases preparatorias integradas y 3 años de especialización",
          }),
          d2: t({
            en: "Preparatory studies: Mathematics (numerical analysis, algebra), Physics (mechanics, electrostatics, thermodynamics), Engineering Sciences",
            fr: "Études préparatoires : Mathématiques (analyse numérique, algèbre), Physique (mécanique, électrostatique, thermodynamique), Sciences de l'Ingénieur",
            es: "Estudios preparatorios: Matemáticas (análisis numérico, álgebra), Física (mecánica, electrostática, termodinámica), Ciencias de la Ingeniería",
          }),
          d3: t({
            en: "Specialization: Digital & analog electronics, system administration under Linux, web programming, OOP in Java, computer networks (routing, security)",
            fr: "Spécialisation : Électronique numérique et analogique, administration système sous Linux, programmation web, POO en Java, réseaux informatiques (routage, sécurité)",
            es: "Especialización: Electrónica digital y analógica, administración de sistemas bajo Linux, programación web, POO en Java, redes informáticas (enrutamiento, seguridad)",
          }),
        },
        achievements: {
          a1: t({
            en: "Graduated with an Engineering Degree",
            fr: "Diplômé avec un titre d'Ingénieur",
            es: "Graduado con un título de Ingeniería",
          }),
          a2: t({
            en: "Successfully completed multiple student projects",
            fr: "Réalisation réussie de multiples projets étudiants",
            es: "Finalización exitosa de múltiples proyectos estudiantiles",
          }),
          a3: t({
            en: "Final year project successfully defended",
            fr: "Projet de fin d'études soutenu avec succès",
            es: "Proyecto de fin de estudios defendido con éxito",
          }),
        },
      },

      lycee: {
        title: t({
          en: "High School Diploma in Science",
          fr: "Baccalauréat Scientifique",
          es: "Bachillerato en Ciencias",
        }),
        description: {
          d1: t({
            en: "Courses in Mathematics · Physics · Chemistry · English · French",
            fr: "Cours de Mathématiques · Physique · Chimie · Anglais · Français",
            es: "Cursos de Matemáticas · Física · Química · Inglés · Francés",
          }),
        },
        achievements: {
          a1: t({
            en: "Admitted with distinction",
            fr: "Admis avec distinction",
            es: "Admitido con distinción",
          }),
          a2: t({
            en: "Received an excellence scholarship from the Guinean government",
            fr: "Bénéficiaire d'une bourse d'excellence du gouvernement guinéen",
            es: "Beneficiario de una beca de excelencia del gobierno guineano",
          }),
        },
      },
    },
  },
} satisfies Dictionary;

export default cvDataContent;
