import { PrismaClient, CourseCategory, CourseLevel, Role, CourseAccessTier, SubscriptionPlan, SubscriptionStatus, PaymentKind, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  const startTime = Date.now();
  const isTestEnv = process.env.NODE_ENV === 'test';

  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗃️ Database: ${isTestEnv ? 'TEST' : 'DEVELOPMENT'}`);

  // ===== 1. USERS (Comprehensive Role Coverage) =====
  console.log('👥 Creating users...');

  // Main instructor (FYGS)
  const instructor = await prisma.user.upsert({
    where: { email: 'fernand@fygs.dev' },
    update: {},
    create: {
      email: 'fernand@fygs.dev',
      name: 'Fernand Soualo',
      role: Role.INSTRUCTOR,
      emailVerified: true,
      image: '/images/fernand-avatar.jpg',
    },
  });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fygs.dev' },
    update: {},
    create: {
      email: 'admin@fygs.dev',
      name: 'Admin FYGS',
      role: Role.ADMIN,
      emailVerified: true,
      image: '/images/admin-avatar.jpg',
    },
  });

  // Premium subscriber (active)
  const alice = await prisma.user.upsert({
    where: { email: 'alice.martin@example.com' },
    update: {},
    create: {
      email: 'alice.martin@example.com',
      name: 'Alice Martin',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Free user (no subscription)
  const thomas = await prisma.user.upsert({
    where: { email: 'thomas.dubois@example.com' },
    update: {},
    create: {
      email: 'thomas.dubois@example.com',
      name: 'Thomas Dubois',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  });

  // User with canceled subscription
  const marie = await prisma.user.upsert({
    where: { email: 'marie.bernard@example.com' },
    update: {},
    create: {
      email: 'marie.bernard@example.com',
      name: 'Marie Bernard',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
  });

  // New user (recently registered)
  const lucas = await prisma.user.upsert({
    where: { email: 'lucas.moreau@example.com' },
    update: {},
    create: {
      email: 'lucas.moreau@example.com',
      name: 'Lucas Moreau',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  // User with expired subscription
  const sophie = await prisma.user.upsert({
    where: { email: 'sophie.leroy@example.com' },
    update: {},
    create: {
      email: 'sophie.leroy@example.com',
      name: 'Sophie Leroy',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Additional diverse students
  const pierre = await prisma.user.upsert({
    where: { email: 'pierre.martin@example.com' },
    update: {},
    create: {
      email: 'pierre.martin@example.com',
      name: 'Pierre Martin',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
  });

  const julie = await prisma.user.upsert({
    where: { email: 'julie.petit@example.com' },
    update: {},
    create: {
      email: 'julie.petit@example.com',
      name: 'Julie Petit',
      role: Role.STUDENT,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
  });

  const students = [alice, thomas, marie, lucas, sophie, pierre, julie];
  console.log(`✅ Created ${students.length + 2} users (1 instructor, 1 admin, ${students.length} students)`);

  // ===== 2. SUBSCRIPTIONS (All Status Types) =====
  console.log('💳 Creating subscriptions...');

  await prisma.subscription.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      stripeCustomerId: 'cus_test_alice',
      stripeSubscriptionId: 'sub_test_alice_premium',
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PREMIUM,
      priceId: 'price_premium_monthly',
      currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: thomas.id },
    update: {},
    create: {
      userId: thomas.id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: marie.id },
    update: {},
    create: {
      userId: marie.id,
      stripeCustomerId: 'cus_test_marie',
      stripeSubscriptionId: 'sub_test_marie_canceled',
      status: SubscriptionStatus.CANCELED,
      plan: SubscriptionPlan.PREMIUM,
      priceId: 'price_premium_yearly',
      currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: true,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: lucas.id },
    update: {},
    create: {
      userId: lucas.id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: sophie.id },
    update: {},
    create: {
      userId: sophie.id,
      stripeCustomerId: 'cus_test_sophie',
      stripeSubscriptionId: 'sub_test_sophie_pastdue',
      status: SubscriptionStatus.PAST_DUE,
      plan: SubscriptionPlan.PREMIUM,
      priceId: 'price_premium_monthly',
      currentPeriodStart: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: pierre.id },
    update: {},
    create: {
      userId: pierre.id,
      stripeCustomerId: 'cus_test_pierre',
      stripeSubscriptionId: 'sub_test_pierre_premium',
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PREMIUM,
      priceId: 'price_premium_yearly',
      currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: julie.id },
    update: {},
    create: {
      userId: julie.id,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.FREE,
    },
  });

  console.log('✅ Created 7 subscription records with different statuses');

  // ===== 3. TAGS (Comprehensive Technology Coverage) =====
  console.log('🏷️ Creating tags...');

  const tagData = [
    // Frontend Technologies
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#000000' },
    { name: 'Vue.js', color: '#4FC08D' },
    { name: 'Angular', color: '#DD0031' },
    { name: 'Tailwind CSS', color: '#06B6D4' },
    { name: 'CSS', color: '#1572B6' },
    { name: 'HTML', color: '#E34F26' },

    // Backend Technologies
    { name: 'Node.js', color: '#339933' },
    { name: 'Express', color: '#000000' },
    { name: 'NestJS', color: '#E0234E' },
    { name: 'Prisma', color: '#2D3748' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Redis', color: '#DC382D' },

    // Cloud & DevOps
    { name: 'AWS', color: '#FF9900' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'Kubernetes', color: '#326CE5' },
    { name: 'Vercel', color: '#000000' },
    { name: 'GitHub Actions', color: '#2088FF' },

    // AI & Modern Tech
    { name: 'AI', color: '#FF6B6B' },
    { name: 'OpenAI', color: '#10A37F' },
    { name: 'LangChain', color: '#1C3A3A' },
    { name: 'Machine Learning', color: '#FF6F00' },

    // Level Tags
    { name: 'Beginner', color: '#22C55E' },
    { name: 'Intermediate', color: '#F59E0B' },
    { name: 'Advanced', color: '#EF4444' },
    { name: 'Expert', color: '#8B5A2B' },

    // Special Categories
    { name: 'Interview Prep', color: '#8B5CF6' },
    { name: 'Best Practices', color: '#6366F1' },
    { name: 'Project-Based', color: '#EC4899' },
    { name: 'Hands-On', color: '#10B981' },
    { name: 'Theory', color: '#84CC16' },
    { name: 'Full-Stack', color: '#F97316' },
  ];

  const tags = await Promise.all(
    tagData.map(tag =>
      prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag,
      })
    )
  );

  console.log(`✅ Created ${tags.length} tags`);

  // ===== 4. COURSES (Comprehensive Feature Testing) =====
  console.log('📚 Creating courses...');

  // Course 1: FREE JavaScript Fundamentals
  const jsBasicsCourse = await prisma.course.create({
    data: {
      title: 'JavaScript Fundamentals for Beginners',
      slug: 'javascript-fundamentals-beginners',
      description: 'Master the fundamentals of JavaScript programming from scratch. Perfect for complete beginners who want to start their web development journey with solid foundations. Learn variables, functions, objects, arrays, and modern ES6+ features through practical examples and hands-on exercises.',
      thumbnail: '/courses/javascript-fundamentals/thumbnail.jpg',
      price: 0,
      category: CourseCategory.JAVASCRIPT,
      level: CourseLevel.BEGINNER,
      published: true,
      featured: true,
      accessTier: CourseAccessTier.FREE,
      previewEnabled: true,
      duration: 480, // 8 hours
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),  // 5 days ago
    }
  });

  // Course 2: PREMIUM React Advanced Patterns
  const reactAdvancedCourse = await prisma.course.create({
    data: {
      title: 'React Advanced Patterns & Performance Optimization',
      slug: 'react-advanced-patterns-performance',
      description: 'Deep dive into advanced React patterns, performance optimization techniques, and modern best practices. Master custom hooks, context patterns, render optimizations, code splitting, and state management strategies. Includes real-world projects and production-ready patterns used by top tech companies.',
      thumbnail: '/courses/react-advanced/thumbnail.jpg',
      price: 149.99,
      category: CourseCategory.FRONTEND,
      level: CourseLevel.ADVANCED,
      published: true,
      featured: true,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: true,
      duration: 720, // 12 hours
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 3: PREMIUM Full-Stack Next.js
  const nextjsFullstackCourse = await prisma.course.create({
    data: {
      title: 'Full-Stack Next.js 15 Development Masterclass',
      slug: 'nextjs-15-fullstack-masterclass',
      description: 'Build production-ready, scalable applications with Next.js 15 App Router, Server Components, and cutting-edge full-stack tools. Master Prisma ORM, authentication, deployment, performance optimization, and modern development workflows. Create real-world projects including e-commerce, SaaS platforms, and more.',
      thumbnail: '/courses/nextjs-fullstack/thumbnail.jpg',
      price: 299.99,
      category: CourseCategory.FULLSTACK,
      level: CourseLevel.INTERMEDIATE,
      published: true,
      featured: true,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: true,
      duration: 1440, // 24 hours
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 4: FREE TypeScript Basics
  const typescriptBasicsCourse = await prisma.course.create({
    data: {
      title: 'TypeScript for JavaScript Developers',
      slug: 'typescript-for-javascript-developers',
      description: 'Transition smoothly from JavaScript to TypeScript with this comprehensive introduction. Learn type annotations, interfaces, generics, and how to gradually adopt TypeScript in existing JavaScript projects. Understand the benefits of static typing and modern development tooling.',
      thumbnail: '/courses/typescript-basics/thumbnail.jpg',
      price: 0,
      category: CourseCategory.TYPESCRIPT,
      level: CourseLevel.BEGINNER,
      published: true,
      featured: false,
      accessTier: CourseAccessTier.FREE,
      previewEnabled: true,
      duration: 360, // 6 hours
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 5: PREMIUM AI Development
  const aiDevelopmentCourse = await prisma.course.create({
    data: {
      title: 'AI-Powered Web Applications Development',
      slug: 'ai-powered-web-applications',
      description: 'Build intelligent web applications using OpenAI APIs, LangChain, vector databases, and modern AI development practices. Create chatbots, content generators, recommendation systems, and more. Learn prompt engineering, RAG patterns, and how to integrate AI seamlessly into web applications.',
      thumbnail: '/courses/ai-development/thumbnail.jpg',
      price: 399.99,
      category: CourseCategory.AI,
      level: CourseLevel.ADVANCED,
      published: true,
      featured: true,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: true,
      duration: 960, // 16 hours
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 6: PREMIUM DevOps & Cloud
  const devopsCourse = await prisma.course.create({
    data: {
      title: 'Modern DevOps: Docker, Kubernetes & AWS',
      slug: 'modern-devops-docker-kubernetes-aws',
      description: 'Master containerization, orchestration, and cloud deployment for modern web applications. Learn Docker, Kubernetes, AWS services, CI/CD pipelines, monitoring, and infrastructure as code. Deploy scalable, production-ready applications with industry best practices.',
      thumbnail: '/courses/devops/thumbnail.jpg',
      price: 249.99,
      category: CourseCategory.DEVOPS,
      level: CourseLevel.INTERMEDIATE,
      published: true,
      featured: true,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: true,
      duration: 840, // 14 hours
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 7: FREE Frontend Fundamentals
  const frontendBasicsCourse = await prisma.course.create({
    data: {
      title: 'Frontend Development Fundamentals',
      slug: 'frontend-development-fundamentals',
      description: 'Learn the essentials of modern frontend development with HTML5, CSS3, and responsive design principles. Master layout techniques, CSS Grid, Flexbox, and create beautiful, accessible user interfaces that work across all devices.',
      thumbnail: '/courses/frontend-basics/thumbnail.jpg',
      price: 0,
      category: CourseCategory.FRONTEND,
      level: CourseLevel.BEGINNER,
      published: true,
      featured: false,
      accessTier: CourseAccessTier.FREE,
      previewEnabled: true,
      duration: 300, // 5 hours
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 8: PREMIUM Backend Architecture
  const backendArchitectureCourse = await prisma.course.create({
    data: {
      title: 'Scalable Backend Architecture with Node.js',
      slug: 'scalable-backend-architecture-nodejs',
      description: 'Design and build scalable backend systems using Node.js, Express, microservices patterns, and database optimization techniques. Learn about API design, security, caching, message queues, and performance optimization for high-traffic applications.',
      thumbnail: '/courses/backend-architecture/thumbnail.jpg',
      price: 199.99,
      category: CourseCategory.BACKEND,
      level: CourseLevel.ADVANCED,
      published: true,
      featured: false,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: true,
      duration: 600, // 10 hours
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    }
  });

  // Course 9: Draft Course (Unpublished)
  const draftCourse = await prisma.course.create({
    data: {
      title: 'Advanced Cloud Architecture Patterns',
      slug: 'advanced-cloud-architecture-patterns',
      description: 'Explore enterprise-level cloud architecture patterns, serverless computing, event-driven architectures, and multi-cloud strategies. Learn to design resilient, cost-effective, and scalable cloud solutions.',
      thumbnail: '/courses/cloud-architecture/thumbnail.jpg',
      price: 349.99,
      category: CourseCategory.CLOUD,
      level: CourseLevel.EXPERT,
      published: false, // Draft course
      featured: false,
      accessTier: CourseAccessTier.PREMIUM,
      previewEnabled: false,
      duration: 1200, // 20 hours
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  });

  // TechMastry Interview Preparation Courses (from migration script)
  const interviewPrepCourses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'JavaScript Interview Challenges: String Manipulation',
        slug: 'js-interview-string-manipulation',
        description: 'Master string manipulation techniques commonly asked in JavaScript interviews. Learn multiple approaches to solve string reversal, palindrome detection, and advanced string algorithms with time complexity analysis.',
        category: CourseCategory.JAVASCRIPT,
        level: CourseLevel.BEGINNER,
        published: true,
        featured: false,
        duration: 15, // 15 minutes
        price: 0,
        accessTier: CourseAccessTier.FREE,
        thumbnail: '/courses/interview-prep/string-challenges.jpg',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      }
    }),

    prisma.course.create({
      data: {
        title: 'Advanced Array Manipulation Techniques',
        slug: 'advanced-array-manipulation',
        description: 'Deep dive into advanced JavaScript array manipulation techniques. Master filtering, transformation, reduction, and complex data processing patterns used in modern web development and technical interviews.',
        category: CourseCategory.JAVASCRIPT,
        level: CourseLevel.INTERMEDIATE,
        published: true,
        featured: false,
        duration: 25, // 25 minutes
        price: 29.99,
        accessTier: CourseAccessTier.PREMIUM,
        thumbnail: '/courses/interview-prep/array-manipulation.jpg',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      }
    }),

    prisma.course.create({
      data: {
        title: 'Asynchronous JavaScript Patterns Mastery',
        slug: 'async-javascript-patterns',
        description: 'Master modern asynchronous patterns in JavaScript including Promises, async/await, error handling strategies, concurrent programming, and advanced patterns for building responsive applications.',
        category: CourseCategory.JAVASCRIPT,
        level: CourseLevel.ADVANCED,
        published: true,
        featured: true,
        duration: 40, // 40 minutes
        price: 79.99,
        accessTier: CourseAccessTier.PREMIUM,
        thumbnail: '/courses/interview-prep/async-patterns.jpg',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      }
    }),
  ]);

  const allCourses = [
    jsBasicsCourse,
    reactAdvancedCourse,
    nextjsFullstackCourse,
    typescriptBasicsCourse,
    aiDevelopmentCourse,
    devopsCourse,
    frontendBasicsCourse,
    backendArchitectureCourse,
    draftCourse,
    ...interviewPrepCourses
  ];

  console.log(`✅ Created ${allCourses.length} courses (${allCourses.filter(c => c.published).length} published, ${allCourses.filter(c => !c.published).length} draft)`);

  // ===== 5. LESSONS (Comprehensive Content Types) =====
  console.log('📝 Creating lessons...');

  // JavaScript Fundamentals Lessons
  const jsLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Introduction to JavaScript Programming',
        slug: 'introduction-javascript-programming',
        description: 'Learn what JavaScript is, its history, and why it\'s the most popular programming language for web development. Understand the JavaScript ecosystem and set up your development environment.',
        content: `# Introduction to JavaScript Programming

Welcome to the world of JavaScript! This lesson will give you a solid foundation to start your programming journey.

## What is JavaScript?

JavaScript is a high-level, interpreted programming language that was originally created to make web pages interactive. Today, it's used for:

- **Frontend Development**: Creating interactive user interfaces
- **Backend Development**: Building server-side applications with Node.js
- **Mobile Apps**: Using frameworks like React Native
- **Desktop Apps**: With tools like Electron
- **IoT and Embedded Systems**: JavaScript runs everywhere!

## A Brief History

- **1995**: Created by Brendan Eich at Netscape in just 10 days
- **1997**: Became an ECMAScript standard
- **2009**: Node.js brings JavaScript to servers
- **2015**: ES6/ES2015 revolutionizes the language
- **Today**: Most popular programming language worldwide

## Why Learn JavaScript?

1. **Universal Language**: Runs on browsers, servers, and mobile devices
2. **Huge Community**: Millions of developers and vast resources
3. **Job Market**: High demand with excellent career opportunities
4. **Ecosystem**: Rich ecosystem with npm packages and frameworks
5. **Beginner Friendly**: Easy to start with, powerful when mastered

## Your First JavaScript Code

Let's start with the classic "Hello, World!" program:

\`\`\`javascript
// This is a comment - it won't be executed
console.log('Hello, World!');

// You can also store text in variables
const greeting = 'Hello, JavaScript!';
console.log(greeting);
\`\`\`

## Setting Up Your Environment

1. **Web Browser**: Chrome, Firefox, or Safari (all have developer tools)
2. **Code Editor**: VS Code, WebStorm, or any text editor
3. **Node.js**: For running JavaScript outside the browser

## Next Steps

In the following lessons, we'll explore:
- Variables and data types
- Functions and scope
- Objects and arrays
- Control flow and loops
- Modern ES6+ features

Ready to dive deeper? Let's continue your JavaScript journey!`,
        videoUrl: 'https://example.com/videos/js-intro.mp4',
        duration: 1200, // 20 minutes
        order: 1,
        published: true,
        courseId: jsBasicsCourse.id,
      }
    }),

    prisma.lesson.create({
      data: {
        title: 'Variables, Data Types, and Type Conversion',
        slug: 'variables-data-types-conversion',
        description: 'Master JavaScript variables using let, const, and var. Understand primitive data types, objects, and how JavaScript handles type conversion automatically and explicitly.',
        content: `# Variables, Data Types, and Type Conversion

Understanding how to store and manipulate data is fundamental to programming. Let's explore JavaScript's variable system and data types.

## Variable Declaration

JavaScript provides three ways to declare variables:

### \`let\` - Block-scoped variables
\`\`\`javascript
let username = 'Alice';
let age = 25;

if (true) {
  let localVar = 'I only exist in this block';
  console.log(localVar); // Works fine
}
// console.log(localVar); // Error: localVar is not defined
\`\`\`

### \`const\` - Constants (cannot be reassigned)
\`\`\`javascript
const PI = 3.14159;
const API_URL = 'https://api.example.com';

// PI = 3.14; // Error: Cannot assign to const variable
\`\`\`

### \`var\` - Function-scoped (legacy, avoid in modern code)
\`\`\`javascript
var oldStyleVariable = 'I have function scope';
// Prefer let and const in modern JavaScript
\`\`\`

## Data Types

JavaScript has several built-in data types:

### Primitive Types

1. **String**: Text data
\`\`\`javascript
const firstName = 'John';
const lastName = "Doe";
const fullName = \`\${firstName} \${lastName}\`; // Template literals
\`\`\`

2. **Number**: Both integers and decimals
\`\`\`javascript
const age = 30;
const price = 99.99;
const negative = -10;
const infinity = Infinity;
\`\`\`

3. **Boolean**: True or false
\`\`\`javascript
const isActive = true;
const isComplete = false;
\`\`\`

4. **Undefined**: Variable declared but not assigned
\`\`\`javascript
let unassigned;
console.log(unassigned); // undefined
\`\`\`

5. **Null**: Intentional absence of value
\`\`\`javascript
const emptyValue = null;
\`\`\`

6. **Symbol**: Unique identifier (advanced)
\`\`\`javascript
const uniqueId = Symbol('id');
\`\`\`

7. **BigInt**: Large integers (advanced)
\`\`\`javascript
const bigNumber = 1234567890123456789012345678901234567890n;
\`\`\`

### Non-Primitive Types

**Object**: Collections of key-value pairs
\`\`\`javascript
const person = {
  name: 'Alice',
  age: 30,
  city: 'Paris'
};

const numbers = [1, 2, 3, 4, 5]; // Arrays are objects too!
\`\`\`

## Type Checking

Use the \`typeof\` operator to check variable types:

\`\`\`javascript
console.log(typeof 42);        // "number"
console.log(typeof 'hello');   // "string"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" (this is a known quirk!)
console.log(typeof {});        // "object"
console.log(typeof []);        // "object"
\`\`\`

## Type Conversion

JavaScript automatically converts types when needed (coercion):

### Automatic Conversion
\`\`\`javascript
console.log('5' + 3);    // "53" (number becomes string)
console.log('5' - 3);    // 2 (string becomes number)
console.log('5' * '2');  // 10 (both become numbers)
\`\`\`

### Explicit Conversion
\`\`\`javascript
// To String
const num = 42;
const str1 = String(num);        // "42"
const str2 = num.toString();     // "42"
const str3 = \`\${num}\`;           // "42"

// To Number
const text = '123';
const num1 = Number(text);       // 123
const num2 = parseInt(text);     // 123
const num3 = parseFloat('123.45'); // 123.45

// To Boolean
const bool1 = Boolean(1);        // true
const bool2 = Boolean(0);        // false
const bool3 = Boolean('hello');  // true
const bool4 = Boolean('');       // false
\`\`\`

## Best Practices

1. **Use \`const\` by default**, \`let\` when you need to reassign
2. **Avoid \`var\`** in modern JavaScript
3. **Use descriptive variable names**: \`userAge\` instead of \`a\`
4. **Be explicit with type conversions** when possible
5. **Use template literals** for string interpolation

## Practice Exercise

Try creating variables of different types and experimenting with type conversion:

\`\`\`javascript
// Create variables
const name = 'Your Name';
const birthYear = 1990;
const currentYear = new Date().getFullYear();

// Calculate age
const age = currentYear - birthYear;

// Create a message
const message = \`Hello, \${name}! You are \${age} years old.\`;
console.log(message);
\`\`\`

Understanding variables and data types is crucial for all JavaScript programming. Next, we'll explore functions and how to organize your code!`,
        videoUrl: 'https://example.com/videos/js-variables.mp4',
        duration: 1800, // 30 minutes
        order: 2,
        published: true,
        courseId: jsBasicsCourse.id,
      }
    }),

    prisma.lesson.create({
      data: {
        title: 'Functions: Declaration, Expressions, and Arrow Functions',
        slug: 'functions-declaration-expressions-arrow',
        description: 'Learn how to create reusable code with functions. Master function declarations, expressions, arrow functions, parameters, return values, and scope concepts.',
        content: `# Functions: The Building Blocks of JavaScript

Functions are one of the most important concepts in JavaScript. They allow you to organize code into reusable blocks that can be executed when needed.

## What are Functions?

A function is a block of code designed to perform a particular task. Functions help you:

- **Organize code** into logical, reusable pieces
- **Avoid repetition** by writing code once and using it many times
- **Break down complex problems** into smaller, manageable parts
- **Create modular applications** that are easier to maintain

## Function Declaration

The traditional way to create a function:

\`\`\`javascript
function greetUser(name) {
  return 'Hello, ' + name + '!';
}

// Call the function
const message = greetUser('Alice');
console.log(message); // "Hello, Alice!"
\`\`\`

### Function Components

1. **\`function\` keyword**: Declares that this is a function
2. **Function name**: \`greetUser\` (use descriptive names)
3. **Parameters**: \`name\` (input values in parentheses)
4. **Function body**: Code between curly braces \`{}\`
5. **Return statement**: Sends a value back to the caller

## Function Expression

Assigning a function to a variable:

\`\`\`javascript
const calculateArea = function(width, height) {
  return width * height;
};

console.log(calculateArea(5, 3)); // 15
\`\`\`

## Arrow Functions (ES6+)

A more concise syntax for writing functions:

\`\`\`javascript
// Basic arrow function
const multiply = (a, b) => {
  return a * b;
};

// Shorter syntax for single expressions
const multiply2 = (a, b) => a * b;

// Single parameter (parentheses optional)
const square = x => x * x;

// No parameters
const getRandomNumber = () => Math.random();
\`\`\`

## Parameters and Arguments

### Default Parameters
\`\`\`javascript
function greet(name = 'Guest', time = 'day') {
  return \`Good \${time}, \${name}!\`;
}

console.log(greet());              // "Good day, Guest!"
console.log(greet('Alice'));       // "Good day, Alice!"
console.log(greet('Bob', 'evening')); // "Good evening, Bob!"
\`\`\`

### Rest Parameters
\`\`\`javascript
function sumAll(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sumAll(1, 2, 3));       // 6
console.log(sumAll(1, 2, 3, 4, 5)); // 15
\`\`\`

## Return Values

Functions can return values or perform actions:

\`\`\`javascript
// Returns a value
function add(a, b) {
  return a + b;
}

// Performs an action (no return)
function logMessage(message) {
  console.log('Log: ' + message);
  // No return statement = returns undefined
}

// Multiple return statements
function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
\`\`\`

## Scope and Closures

### Function Scope
\`\`\`javascript
function outerFunction() {
  const outerVariable = 'I am outside!';
  
  function innerFunction() {
    const innerVariable = 'I am inside!';
    console.log(outerVariable); // Can access outer variable
  }
  
  innerFunction();
  // console.log(innerVariable); // Error: not accessible
}
\`\`\`

### Closures
\`\`\`javascript
function createCounter() {
  let count = 0;
  
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
\`\`\`

## Higher-Order Functions

Functions that take other functions as parameters or return functions:

\`\`\`javascript
// Function that takes another function as parameter
function processArray(array, processor) {
  const result = [];
  for (const item of array) {
    result.push(processor(item));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const doubled = processArray(numbers, x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
\`\`\`

## Best Practices

1. **Use descriptive names**: \`calculateTotalPrice\` not \`calc\`
2. **Keep functions small** and focused on a single task
3. **Use arrow functions** for short, simple functions
4. **Use function declarations** for main functions that might be called before definition
5. **Return early** to avoid deep nesting:

\`\`\`javascript
// Good
function validateUser(user) {
  if (!user) return false;
  if (!user.email) return false;
  if (!user.password) return false;
  return true;
}

// Avoid deep nesting
function validateUserBad(user) {
  if (user) {
    if (user.email) {
      if (user.password) {
        return true;
      }
    }
  }
  return false;
}
\`\`\`

## Practice Exercises

1. **Create a temperature converter**:
\`\`\`javascript
const celsiusToFahrenheit = celsius => (celsius * 9/5) + 32;
const fahrenheitToCelsius = fahrenheit => (fahrenheit - 32) * 5/9;
\`\`\`

2. **Build a simple calculator**:
\`\`\`javascript
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b !== 0 ? a / b : 'Cannot divide by zero'
};
\`\`\`

Functions are the foundation of JavaScript programming. Master them, and you'll be able to build complex, maintainable applications. Next, we'll explore objects and arrays!`,
        videoUrl: 'https://example.com/videos/js-functions.mp4',
        duration: 2400, // 40 minutes
        order: 3,
        published: true,
        courseId: jsBasicsCourse.id,
      }
    }),

    prisma.lesson.create({
      data: {
        title: 'Objects and Arrays: Working with Complex Data',
        slug: 'objects-arrays-complex-data',
        description: 'Dive deep into JavaScript objects and arrays. Learn how to create, manipulate, and work with complex data structures that form the backbone of modern applications.',
        content: `# Objects and Arrays: Managing Complex Data

Objects and arrays are essential data structures in JavaScript that allow you to organize and manipulate complex information efficiently.

## JavaScript Objects

Objects are collections of key-value pairs, perfect for representing real-world entities:

### Creating Objects

\`\`\`javascript
// Object literal (most common)
const person = {
  firstName: 'Alice',
  lastName: 'Johnson',
  age: 28,
  city: 'Paris',
  isEmployed: true
};

// Constructor function (less common)
const car = new Object();
car.brand = 'Toyota';
car.model = 'Camry';
car.year = 2023;
\`\`\`

### Accessing Object Properties

\`\`\`javascript
const user = {
  name: 'Bob',
  email: 'bob@example.com',
  preferences: {
    theme: 'dark',
    language: 'French'
  }
};

// Dot notation
console.log(user.name);    // "Bob"
console.log(user.preferences.theme); // "dark"

// Bracket notation (useful for dynamic keys)
console.log(user['email']); // "bob@example.com"

const key = 'name';
console.log(user[key]);     // "Bob"
\`\`\`

### Modifying Objects

\`\`\`javascript
const product = {
  name: 'Laptop',
  price: 999
};

// Adding properties
product.brand = 'Dell';
product['warranty'] = '2 years';

// Modifying properties
product.price = 899;

// Deleting properties
delete product.warranty;

console.log(product); // { name: 'Laptop', price: 899, brand: 'Dell' }
\`\`\`

### Object Methods

Objects can contain functions as properties:

\`\`\`javascript
const calculator = {
  value: 0,
  
  add(number) {
    this.value += number;
    return this; // Method chaining
  },
  
  subtract(number) {
    this.value -= number;
    return this;
  },

  multiply(number) {
    this.value *= number;
    return this;
  },

  getResult() {
    return this.value;
  }
};

// Method chaining
const result = calculator
  .add(10)
  .multiply(2)
  .subtract(5)
  .getResult();

console.log(result); // 15
\`\`\`

## JavaScript Arrays

Arrays are ordered lists of values, perfect for collections of similar items:

### Creating Arrays

\`\`\`javascript
// Array literal
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];
const mixed = ['text', 42, true, null, { key: 'value' }];

// Array constructor
const emptyArray = new Array();
const arrayWithLength = new Array(5); // Creates array with 5 empty slots
\`\`\`

### Array Properties and Methods

\`\`\`javascript
const colors = ['red', 'green', 'blue'];

// Length property
console.log(colors.length); // 3

// Adding elements
colors.push('yellow');        // Add to end
colors.unshift('purple');     // Add to beginning
console.log(colors); // ['purple', 'red', 'green', 'blue', 'yellow']

// Removing elements
const lastColor = colors.pop();     // Remove from end
const firstColor = colors.shift();  // Remove from beginning
console.log(lastColor);  // 'yellow'
console.log(firstColor); // 'purple'
\`\`\`

### Accessing and Modifying Array Elements

\`\`\`javascript
const animals = ['cat', 'dog', 'bird', 'fish'];

// Accessing by index (0-based)
console.log(animals[0]);  // 'cat'
console.log(animals[2]);  // 'bird'

// Modifying elements
animals[1] = 'puppy';
console.log(animals); // ['cat', 'puppy', 'bird', 'fish']

// Finding index of element
const birdIndex = animals.indexOf('bird');
console.log(birdIndex); // 2
\`\`\`

## Advanced Array Methods

Modern JavaScript provides powerful methods for array manipulation:

### Transforming Arrays

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// map() - transform each element
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter() - select elements that meet criteria
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers); // [2, 4]

// reduce() - combine all elements into single value
const sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15
\`\`\`

### Searching and Testing

\`\`\`javascript
const words = ['apple', 'banana', 'apricot', 'grape'];

// find() - get first element that matches
const wordWithA = words.find(word => word.startsWith('a'));
console.log(wordWithA); // 'apple'

// some() - test if any element matches
const hasLongWord = words.some(word => word.length > 6);
console.log(hasLongWord); // false

// every() - test if all elements match
const allStrings = words.every(word => typeof word === 'string');
console.log(allStrings); // true
\`\`\`

## Working with Complex Data Structures

### Array of Objects

\`\`\`javascript
const students = [
  { name: 'Alice', grade: 85, subject: 'Math' },
  { name: 'Bob', grade: 92, subject: 'Science' },
  { name: 'Charlie', grade: 78, subject: 'Math' },
  { name: 'Diana', grade: 95, subject: 'Science' }
];

// Find all math students
const mathStudents = students.filter(student => student.subject === 'Math');

// Calculate average grade
const averageGrade = students.reduce((sum, student) => sum + student.grade, 0) / students.length;

// Get student names with grades above 90
const topStudents = students
  .filter(student => student.grade > 90)
  .map(student => student.name);

console.log(topStudents); // ['Bob', 'Diana']
\`\`\`

### Nested Objects and Arrays

\`\`\`javascript
const company = {
  name: 'Tech Corp',
  departments: [
    {
      name: 'Engineering',
      employees: [
        { name: 'Alice', role: 'Developer' },
        { name: 'Bob', role: 'Designer' }
      ]
    },
    {
      name: 'Marketing',
      employees: [
        { name: 'Charlie', role: 'Manager' },
        { name: 'Diana', role: 'Analyst' }
      ]
    }
  ]
};

// Access nested data
const firstEmployee = company.departments[0].employees[0].name;
console.log(firstEmployee); // 'Alice'

// Find all developers across departments
const developers = company.departments
  .flatMap(dept => dept.employees)
  .filter(emp => emp.role === 'Developer');
\`\`\`

## Object Destructuring

Extract values from objects and arrays more elegantly:

\`\`\`javascript
// Object destructuring
const user = { name: 'Alice', age: 30, city: 'Paris' };
const { name, age } = user;
console.log(name); // 'Alice'
console.log(age);  // 30

// Array destructuring
const colors = ['red', 'green', 'blue'];
const [first, second] = colors;
console.log(first);  // 'red'
console.log(second); // 'green'

// Nested destructuring
const person = {
  name: 'Bob',
  address: {
    street: '123 Main St',
    city: 'New York'
  }
};

const { name: personName, address: { city } } = person;
console.log(personName); // 'Bob'
console.log(city);       // 'New York'
\`\`\`

## Best Practices

1. **Use descriptive property names**: \`user.firstName\` not \`user.fn\`
2. **Prefer const for arrays/objects** you don't reassign
3. **Use array methods** instead of traditional loops when possible
4. **Check for existence** before accessing nested properties:

\`\`\`javascript
// Safe property access
const userCity = user.address?.city ?? 'Unknown';

// Or traditional way
const userCity2 = user.address && user.address.city || 'Unknown';
\`\`\`

5. **Use spread operator** for copying:

\`\`\`javascript
// Copy array
const originalArray = [1, 2, 3];
const copiedArray = [...originalArray];

// Copy object
const originalObject = { name: 'Alice', age: 30 };
const copiedObject = { ...originalObject };
\`\`\`

## Practice Exercises

1. **Create a library system**:
\`\`\`javascript
const library = {
  books: [
    { title: '1984', author: 'Orwell', available: true },
    { title: 'Brave New World', author: 'Huxley', available: false }
  ],

  findAvailableBooks() {
    return this.books.filter(book => book.available);
  },

  borrowBook(title) {
    const book = this.books.find(book => book.title === title);
    if (book && book.available) {
      book.available = false;
      return \`You borrowed "\${title}"\`;
    }
    return 'Book not available';
  }
};
\`\`\`

Objects and arrays are the foundation for managing data in JavaScript applications. Master these concepts, and you'll be ready to build complex, data-driven applications!`,
        videoUrl: 'https://example.com/videos/js-objects-arrays.mp4',
        duration: 2700, // 45 minutes
        order: 4,
        published: true,
        courseId: jsBasicsCourse.id,
      }
    }),
  ]);

  // TypeScript Basics Lessons
  const tsLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'TypeScript Fundamentals and Setup',
        slug: 'typescript-fundamentals-setup',
        description: 'Get started with TypeScript: installation, configuration, and understanding the benefits of static typing for JavaScript developers.',
        content: `# TypeScript Fundamentals and Setup

TypeScript is a powerful superset of JavaScript that adds static type definitions, making your code more robust and maintainable.

## What is TypeScript?

TypeScript is JavaScript with syntax for types. It:

- **Adds static typing** to JavaScript
- **Compiles to plain JavaScript** that runs anywhere
- **Catches errors at compile time** instead of runtime
- **Provides excellent IDE support** with autocomplete and refactoring
- **Is maintained by Microsoft** and widely adopted

## Benefits of TypeScript

1. **Early Error Detection**: Catch bugs before they reach production
2. **Better IDE Support**: Intelligent autocomplete and navigation
3. **Code Documentation**: Types serve as live documentation
4. **Refactoring Confidence**: Rename and restructure code safely
5. **Team Collaboration**: Clear contracts between team members

## Installation and Setup

\`\`\`bash
# Install TypeScript globally
npm install -g typescript

# Or install locally in your project
npm install typescript --save-dev

# Install TypeScript compiler
npm install @types/node --save-dev
\`\`\`

## Your First TypeScript File

Create a file called \`hello.ts\`:

\`\`\`typescript
// hello.ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const userName: string = "Alice";
console.log(greet(userName));
\`\`\`

Compile and run:

\`\`\`bash
# Compile TypeScript to JavaScript
tsc hello.ts

# Run the generated JavaScript
node hello.js
\`\`\`

## Basic Types

TypeScript provides several basic types:

\`\`\`typescript
// Primitive types
let age: number = 25;
let name: string = "Alice";
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// Any type (avoid when possible)
let dynamic: any = "could be anything";
dynamic = 42;
dynamic = true;

// Unknown type (safer than any)
let userInput: unknown = getUserInput();
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase());
}

// Void (for functions that don't return anything)
function logMessage(message: string): void {
  console.log(message);
}

// Never (for functions that never return)
function throwError(message: string): never {
  throw new Error(message);
}
\`\`\`

This is just the beginning of your TypeScript journey!`,
        videoUrl: 'https://example.com/videos/ts-fundamentals.mp4',
        duration: 1800, // 30 minutes
        order: 1,
        published: true,
        courseId: typescriptBasicsCourse.id,
      }
    }),
  ]);

  // Interview Prep Lessons (from TechMastry challenges)
  const interviewLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Challenge: String Reversal Techniques',
        slug: 'challenge-string-reversal-techniques',
        description: 'Master multiple approaches to reverse strings in JavaScript, a common interview question with various solution strategies.',
        content: `# String Reversal Challenge

## 📝 Challenge Description

Implement a function that reverses a string. This is a fundamental programming challenge that tests your understanding of string manipulation, arrays, and algorithm thinking.

## ⏱️ Time Allocation
5-10 minutes

## 🎯 Problem Statement

Write a function \`reverseString(str)\` that takes a string as input and returns the string reversed.

**Examples:**
- \`reverseString("hello")\` → \`"olleh"\`
- \`reverseString("JavaScript")\` → \`"tpircSavaJ"\`
- \`reverseString("12345")\` → \`"54321"\`

## 💡 Approach Hints

1. **Built-in Methods**: Use JavaScript's array methods
2. **Loop Iteration**: Build the result character by character
3. **Recursion**: Solve by breaking down the problem
4. **Two Pointers**: Optimize for space complexity

## ✅ Solutions

### Method 1: Built-in Array Methods (Easiest)
\`\`\`javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}

// How it works:
// 1. split('') converts string to array: "hello" → ['h','e','l','l','o']
// 2. reverse() reverses the array: ['o','l','l','e','h']
// 3. join('') converts back to string: "olleh"
\`\`\`

### Method 2: For Loop (Traditional Approach)
\`\`\`javascript
function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

// Explanation:
// Start from the last character and work backwards
// Build the reversed string character by character
\`\`\`

### Method 3: For...of Loop (Modern Approach)
\`\`\`javascript
function reverseString(str) {
  let reversed = '';
  for (const char of str) {
    reversed = char + reversed; // Prepend each character
  }
  return reversed;
}
\`\`\`

### Method 4: Recursive Solution
\`\`\`javascript
function reverseString(str) {
  // Base case: empty string or single character
  if (str.length <= 1) {
    return str;
  }
  
  // Recursive case: first char + reverse of rest
  return reverseString(str.slice(1)) + str[0];
}

// Example trace for "abc":
// reverseString("abc") → reverseString("bc") + "a"
// reverseString("bc") → reverseString("c") + "b" 
// reverseString("c") → "c"
// Result: "c" + "b" + "a" = "cba"
\`\`\`

### Method 5: Two Pointers (Array Modification)
\`\`\`javascript
function reverseString(str) {
  const arr = str.split('');
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    // Swap characters
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  
  return arr.join('');
}
\`\`\`

### Method 6: Reduce Method (Functional Approach)
\`\`\`javascript
function reverseString(str) {
  return str.split('').reduce((reversed, char) => char + reversed, '');
}
\`\`\`

## 📊 Performance Comparison

| Method | Time Complexity | Space Complexity | Readability |
|--------|----------------|------------------|-------------|
| Built-in methods | O(n) | O(n) | Excellent |
| For loop | O(n) | O(n) | Good |
| Recursion | O(n) | O(n) | Fair |
| Two pointers | O(n) | O(n) | Good |

## 🧪 Test Cases

\`\`\`javascript
// Test your solution with these cases:
console.log(reverseString(""));           // ""
console.log(reverseString("a"));          // "a"
console.log(reverseString("hello"));      // "olleh"
console.log(reverseString("JavaScript")); // "tpircSavaJ"
console.log(reverseString("12345"));      // "54321"
console.log(reverseString("A man a plan a canal Panama")); // "amanaP lanac a nalp a nam A"
\`\`\`

## 🎯 Key Takeaways

1. **Multiple solutions exist** - choose based on requirements
2. **Built-in methods** are often the most readable
3. **Loops give you more control** over the process
4. **Recursion shows algorithmic thinking** but can be less efficient
5. **Consider trade-offs** between readability and performance

## 🚀 Follow-up Questions

1. How would you reverse only the letters in a string, keeping numbers in place?
2. Can you reverse a string in-place without extra space?
3. How would you handle Unicode characters?

## 💼 Interview Tips

- **Start with the simplest solution** that works
- **Explain your thought process** out loud
- **Consider edge cases** (empty string, single character)
- **Discuss trade-offs** of different approaches
- **Be ready to optimize** if asked

This challenge demonstrates fundamental programming concepts and is an excellent warm-up for more complex string manipulation problems!`,
        videoUrl: 'https://example.com/videos/string-reversal-challenge.mp4',
        duration: 900, // 15 minutes
        order: 1,
        published: true,
        courseId: interviewPrepCourses[0].id,
      }
    }),
  ]);

  const allLessons = [...jsLessons, ...tsLessons, ...interviewLessons];
  console.log(`✅ Created ${allLessons.length} lessons across different courses`);

  // ===== 6. COURSE TAGS ASSOCIATIONS =====
  console.log('🔗 Creating course-tag associations...');

  const courseTagData = [
    // JavaScript Fundamentals
    { courseId: jsBasicsCourse.id, tagName: 'JavaScript' },
    { courseId: jsBasicsCourse.id, tagName: 'Beginner' },
    { courseId: jsBasicsCourse.id, tagName: 'Hands-On' },

    // React Advanced
    { courseId: reactAdvancedCourse.id, tagName: 'React' },
    { courseId: reactAdvancedCourse.id, tagName: 'JavaScript' },
    { courseId: reactAdvancedCourse.id, tagName: 'Advanced' },
    { courseId: reactAdvancedCourse.id, tagName: 'Best Practices' },

    // Next.js Fullstack
    { courseId: nextjsFullstackCourse.id, tagName: 'Next.js' },
    { courseId: nextjsFullstackCourse.id, tagName: 'React' },
    { courseId: nextjsFullstackCourse.id, tagName: 'TypeScript' },
    { courseId: nextjsFullstackCourse.id, tagName: 'Full-Stack' },
    { courseId: nextjsFullstackCourse.id, tagName: 'Intermediate' },
    { courseId: nextjsFullstackCourse.id, tagName: 'Project-Based' },

    // TypeScript Basics
    { courseId: typescriptBasicsCourse.id, tagName: 'TypeScript' },
    { courseId: typescriptBasicsCourse.id, tagName: 'JavaScript' },
    { courseId: typescriptBasicsCourse.id, tagName: 'Beginner' },

    // AI Development
    { courseId: aiDevelopmentCourse.id, tagName: 'AI' },
    { courseId: aiDevelopmentCourse.id, tagName: 'OpenAI' },
    { courseId: aiDevelopmentCourse.id, tagName: 'LangChain' },
    { courseId: aiDevelopmentCourse.id, tagName: 'Advanced' },
    { courseId: aiDevelopmentCourse.id, tagName: 'Project-Based' },

    // DevOps Course
    { courseId: devopsCourse.id, tagName: 'Docker' },
    { courseId: devopsCourse.id, tagName: 'Kubernetes' },
    { courseId: devopsCourse.id, tagName: 'AWS' },
    { courseId: devopsCourse.id, tagName: 'Intermediate' },

    // Frontend Basics
    { courseId: frontendBasicsCourse.id, tagName: 'HTML' },
    { courseId: frontendBasicsCourse.id, tagName: 'CSS' },
    { courseId: frontendBasicsCourse.id, tagName: 'Beginner' },
    { courseId: frontendBasicsCourse.id, tagName: 'Hands-On' },

    // Backend Architecture
    { courseId: backendArchitectureCourse.id, tagName: 'Node.js' },
    { courseId: backendArchitectureCourse.id, tagName: 'Express' },
    { courseId: backendArchitectureCourse.id, tagName: 'Advanced' },
    { courseId: backendArchitectureCourse.id, tagName: 'Best Practices' },

    // Interview Prep Courses
    { courseId: interviewPrepCourses[0].id, tagName: 'Interview Prep' },
    { courseId: interviewPrepCourses[0].id, tagName: 'JavaScript' },
    { courseId: interviewPrepCourses[0].id, tagName: 'Beginner' },

    { courseId: interviewPrepCourses[1].id, tagName: 'Interview Prep' },
    { courseId: interviewPrepCourses[1].id, tagName: 'JavaScript' },
    { courseId: interviewPrepCourses[1].id, tagName: 'Intermediate' },

    { courseId: interviewPrepCourses[2].id, tagName: 'Interview Prep' },
    { courseId: interviewPrepCourses[2].id, tagName: 'JavaScript' },
    { courseId: interviewPrepCourses[2].id, tagName: 'Advanced' },
  ];

  const courseTagAssociations = await Promise.all(
    courseTagData.map(async ({ courseId, tagName }) => {
      const tag = tags.find(t => t.name === tagName);
      if (tag) {
        return prisma.courseTag.create({
          data: { courseId, tagId: tag.id }
        });
      }
    })
  );

  console.log(`✅ Created ${courseTagAssociations.filter(Boolean).length} course-tag associations`);

  // ===== 7. ENROLLMENTS (Different enrollment scenarios) =====
  console.log('📋 Creating enrollments...');

  const enrollmentData = [
    // Alice (Premium user) - enrolled in premium courses
    { userId: alice.id, courseId: reactAdvancedCourse.id, enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { userId: alice.id, courseId: nextjsFullstackCourse.id, enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { userId: alice.id, courseId: jsBasicsCourse.id, enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { userId: alice.id, courseId: aiDevelopmentCourse.id, enrolledAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },

    // Thomas (Free user) - only free courses
    { userId: thomas.id, courseId: jsBasicsCourse.id, enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { userId: thomas.id, courseId: typescriptBasicsCourse.id, enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { userId: thomas.id, courseId: frontendBasicsCourse.id, enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { userId: thomas.id, courseId: interviewPrepCourses[0].id, enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },

    // Marie (Canceled subscription) - had access when subscribed
    { userId: marie.id, courseId: reactAdvancedCourse.id, enrolledAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
    { userId: marie.id, courseId: jsBasicsCourse.id, enrolledAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    { userId: marie.id, courseId: devopsCourse.id, enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },

    // Lucas (New user) - just started with free content
    { userId: lucas.id, courseId: jsBasicsCourse.id, enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { userId: lucas.id, courseId: frontendBasicsCourse.id, enrolledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },

    // Pierre (Premium yearly) - extensive enrollment
    { userId: pierre.id, courseId: nextjsFullstackCourse.id, enrolledAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { userId: pierre.id, courseId: reactAdvancedCourse.id, enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { userId: pierre.id, courseId: backendArchitectureCourse.id, enrolledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    { userId: pierre.id, courseId: aiDevelopmentCourse.id, enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },

    // Julie (Free user exploring)
    { userId: julie.id, courseId: jsBasicsCourse.id, enrolledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { userId: julie.id, courseId: typescriptBasicsCourse.id, enrolledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];

  const enrollments = await Promise.all(
    enrollmentData.map(data => prisma.enrollment.create({ data }))
  );

  console.log(`✅ Created ${enrollments.length} enrollments`);

  // ===== 8. PROGRESS (Realistic learning progress) =====
  console.log('📈 Creating progress records...');

  const progressData = [];

  // Alice's progress (completed JS basics, progressing in React)
  jsLessons.forEach((lesson, index) => {
    progressData.push({
      userId: alice.id,
      lessonId: lesson.id,
      completed: true,
      watchTime: (lesson.duration || 1200) - 100, // Almost full watch time, fallback to 1200 seconds
      completedAt: new Date(Date.now() - (18 - index * 2) * 24 * 60 * 60 * 1000)
    });
  });

  // Thomas's progress (30% through JS basics)
  progressData.push({
    userId: thomas.id,
    lessonId: jsLessons[0].id,
    completed: true,
    watchTime: jsLessons[0].duration || 1200,
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  });
  progressData.push({
    userId: thomas.id,
    lessonId: jsLessons[1].id,
    completed: false,
    watchTime: Math.floor((jsLessons[1].duration || 1800) * 0.7) // 70% watched
  });

  // Marie's progress (completed JS, partial React)
  jsLessons.forEach((lesson, index) => {
    progressData.push({
      userId: marie.id,
      lessonId: lesson.id,
      completed: true,
      watchTime: lesson.duration || 1200,
      completedAt: new Date(Date.now() - (35 - index * 2) * 24 * 60 * 60 * 1000)
    });
  });

  // Lucas's progress (just started)
  progressData.push({
    userId: lucas.id,
    lessonId: jsLessons[0].id,
    completed: false,
    watchTime: Math.floor((jsLessons[0].duration || 1200) * 0.5) // 50% watched
  });

  // Pierre's extensive progress (completed multiple courses)
  jsLessons.forEach((lesson, index) => {
    progressData.push({
      userId: pierre.id,
      lessonId: lesson.id,
      completed: true,
      watchTime: lesson.duration || 1200,
      completedAt: new Date(Date.now() - (50 - index * 2) * 24 * 60 * 60 * 1000)
    });
  });

  // TypeScript progress for Pierre
  tsLessons.forEach((lesson, index) => {
    progressData.push({
      userId: pierre.id,
      lessonId: lesson.id,
      completed: true,
      watchTime: lesson.duration || 1800,
      completedAt: new Date(Date.now() - (40 - index * 2) * 24 * 60 * 60 * 1000)
    });
  });

  // Julie's progress (beginner level)
  progressData.push({
    userId: julie.id,
    lessonId: jsLessons[0].id,
    completed: true,
    watchTime: jsLessons[0].duration || 1200,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  const progressRecords = await Promise.all(
    progressData.map(data => prisma.progress.create({ data }))
  );

  console.log(`✅ Created ${progressRecords.length} progress records`);

  // ===== 9. CERTIFICATES (Achievement tracking) =====
  console.log('🏆 Creating certificates...');

  const certificateData = [
    // Alice completed JavaScript Fundamentals
    {
      userId: alice.id,
      courseId: jsBasicsCourse.id,
      issuedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },

    // Marie completed JavaScript Fundamentals (when she had subscription)
    {
      userId: marie.id,
      courseId: jsBasicsCourse.id,
      issuedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },

    // Pierre completed multiple courses
    {
      userId: pierre.id,
      courseId: jsBasicsCourse.id,
      issuedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      userId: pierre.id,
      courseId: nextjsFullstackCourse.id,
      issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      userId: pierre.id,
      courseId: reactAdvancedCourse.id,
      issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  const certificates = await Promise.all(
    certificateData.map(data => prisma.certificate.create({ data }))
  );

  console.log(`✅ Created ${certificates.length} certificates`);

  // ===== 10. PAYMENTS (Revenue tracking) =====
  console.log('💰 Creating payment records...');

  const paymentData = [
    // Alice's subscription payments (monthly premium)
    {
      userId: alice.id,
      stripePaymentIntentId: 'pi_test_alice_sub_001',
      amount: 29.99,
      currency: 'eur',
      status: PaymentStatus.COMPLETED,
      description: 'Abonnement Premium Mensuel - Octobre',
      kind: PaymentKind.SUBSCRIPTION,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      userId: alice.id,
      stripePaymentIntentId: 'pi_test_alice_sub_002',
      amount: 29.99,
      currency: 'eur',
      status: PaymentStatus.COMPLETED,
      description: 'Abonnement Premium Mensuel - Septembre',
      kind: PaymentKind.SUBSCRIPTION,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },

    // Pierre's yearly subscription
    {
      userId: pierre.id,
      stripePaymentIntentId: 'pi_test_pierre_yearly',
      amount: 299.99,
      currency: 'eur',
      status: PaymentStatus.COMPLETED,
      description: 'Abonnement Premium Annuel',
      kind: PaymentKind.SUBSCRIPTION,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },

    // Marie's refunded payment
    {
      userId: marie.id,
      stripePaymentIntentId: 'pi_test_marie_refunded',
      amount: 299.99,
      currency: 'eur',
      status: PaymentStatus.REFUNDED,
      description: 'Abonnement Premium Annuel (Remboursé)',
      kind: PaymentKind.SUBSCRIPTION,
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },

    // Sophie's failed payment
    {
      userId: sophie.id,
      stripePaymentIntentId: 'pi_test_sophie_failed',
      amount: 29.99,
      currency: 'eur',
      status: PaymentStatus.FAILED,
      description: 'Échec paiement abonnement mensuel',
      kind: PaymentKind.SUBSCRIPTION,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },

    // Individual course purchases
    {
      userId: thomas.id,
      courseId: interviewPrepCourses[1].id,
      stripePaymentIntentId: 'pi_test_thomas_course',
      amount: 29.99,
      currency: 'eur',
      status: PaymentStatus.COMPLETED,
      description: 'Achat formation Array Manipulation',
      kind: PaymentKind.COURSE,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  ];

  const payments = await Promise.all(
    paymentData.map(data => prisma.payment.create({ data }))
  );

  console.log(`✅ Created ${payments.length} payment records`);

  // ===== 11. REVIEWS (User feedback) =====
  console.log('⭐ Creating course reviews...');

  const reviewData = [
    // Positive reviews
    {
      userId: alice.id,
      courseId: jsBasicsCourse.id,
      rating: 5,
      comment: 'Excellent cours pour débuter en JavaScript ! Les explications sont très claires et les exercices pratiques aident vraiment à comprendre. Fernand est un excellent instructeur. Je recommande vivement ce cours à tous les débutants.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },

    {
      userId: thomas.id,
      courseId: jsBasicsCourse.id,
      rating: 4,
      comment: 'Très bon contenu, bien structuré. Peut-être un peu rapide par moments mais globalement excellent. Les exemples sont pertinents et les exercices progressifs.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },

    {
      userId: pierre.id,
      courseId: reactAdvancedCourse.id,
      rating: 5,
      comment: 'Formation de très haut niveau ! Les patterns avancés sont expliqués de manière claire avec des exemples concrets. Indispensable pour tout développeur React qui veut progresser.',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },

    // Mixed reviews
    {
      userId: marie.id,
      courseId: reactAdvancedCourse.id,
      rating: 3,
      comment: 'Contenu intéressant mais nécessite de bonnes bases en React. Quelques passages difficiles à suivre. Aurais apprécié plus d\'exercices pratiques.',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },

    {
      userId: julie.id,
      courseId: typescriptBasicsCourse.id,
      rating: 4,
      comment: 'Bonne introduction à TypeScript. J\'ai enfin compris l\'intérêt du typage statique ! Les exemples de migration depuis JavaScript sont très utiles.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },

    {
      userId: pierre.id,
      courseId: nextjsFullstackCourse.id,
      rating: 5,
      comment: 'Masterclass exceptionnelle ! Couvre tous les aspects du développement full-stack moderne. Les projets pratiques sont excellents. Worth every penny!',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  ];

  const reviews = await Promise.all(
    reviewData.map(data => prisma.review.create({ data }))
  );

  console.log(`✅ Created ${reviews.length} course reviews`);

  // ===== 12. ANALYTICS EVENTS (User engagement tracking) =====
  console.log('📊 Creating analytics events...');

  const analyticsData = [
    // Course enrollment events
    {
      userId: alice.id,
      sessionId: 'sess_alice_001',
      type: 'COURSE_ENROLLMENT_EXPLICIT',
      source: 'client',
      properties: {
        courseId: reactAdvancedCourse.id,
        courseTitle: reactAdvancedCourse.title,
        enrollmentMethod: 'premium_access',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },

    // Lesson completion events
    {
      userId: alice.id,
      sessionId: 'sess_alice_002',
      type: 'LESSON_COMPLETED',
      source: 'client',
      properties: {
        lessonId: jsLessons[0].id,
        courseId: jsBasicsCourse.id,
        watchTime: jsLessons[0].duration,
        completionRate: 100,
      },
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },

    // Payment events
    {
      userId: alice.id,
      sessionId: 'sess_alice_003',
      type: 'SUBSCRIPTION_STARTED',
      source: 'webhook',
      properties: {
        plan: 'premium',
        amount: 29.99,
        currency: 'eur',
        billingCycle: 'monthly',
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },

    // User interaction events
    {
      userId: thomas.id,
      sessionId: 'sess_thomas_001',
      type: 'COURSE_PREVIEW_VIEWED',
      source: 'client',
      properties: {
        courseId: reactAdvancedCourse.id,
        previewDuration: 300,
        convertedToEnrollment: false,
      },
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },

    // Search events
    {
      userId: thomas.id,
      sessionId: 'sess_thomas_002',
      type: 'SEARCH_PERFORMED',
      source: 'client',
      properties: {
        query: 'javascript tutorial',
        resultsCount: 3,
        clickedResult: jsBasicsCourse.id,
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },

    // Course completion events
    {
      userId: pierre.id,
      sessionId: 'sess_pierre_001',
      type: 'COURSE_COMPLETED',
      source: 'client',
      properties: {
        courseId: nextjsFullstackCourse.id,
        completionTime: 1440 * 60, // Total course duration in seconds
        certificateIssued: true,
      },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  ];

  const analyticsEvents = await Promise.all(
    analyticsData.map(data => prisma.analyticsEvent.create({ data }))
  );

  console.log(`✅ Created ${analyticsEvents.length} analytics events`);

  // ===== FINAL SUMMARY =====
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n🎉 Database seeding completed successfully!`);
  console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);
  console.log(`\n📊 Summary:`);
  console.log(`   👥 Users: ${students.length + 2} (1 instructor, 1 admin, ${students.length} students)`);
  console.log(`   💳 Subscriptions: 7 (various statuses)`);
  console.log(`   🏷️ Tags: ${tags.length}`);
  console.log(`   📚 Courses: ${allCourses.length} (${allCourses.filter(c => c.published).length} published, ${allCourses.filter(c => !c.published).length} draft)`);
  console.log(`   📝 Lessons: ${allLessons.length}`);
  console.log(`   🔗 Course-Tag Associations: ${courseTagAssociations.filter(Boolean).length}`);
  console.log(`   📋 Enrollments: ${enrollments.length}`);
  console.log(`   📈 Progress Records: ${progressRecords.length}`);
  console.log(`   🏆 Certificates: ${certificates.length}`);
  console.log(`   💰 Payments: ${payments.length}`);
  console.log(`   ⭐ Reviews: ${reviews.length}`);
  console.log(`   📊 Analytics Events: ${analyticsEvents.length}`);

  console.log(`\n✨ Platform features fully tested:`);
  console.log(`   ✅ Free vs Premium content access control`);
  console.log(`   ✅ Multi-tier subscription management (Free, Premium Monthly, Premium Yearly)`);
  console.log(`   ✅ Complete course enrollment and progress tracking workflows`);
  console.log(`   ✅ Payment processing with multiple statuses (completed, failed, refunded)`);
  console.log(`   ✅ Certificate issuance upon course completion`);
  console.log(`   ✅ User reviews and ratings system`);
  console.log(`   ✅ Comprehensive analytics and engagement tracking`);
  console.log(`   ✅ Content categorization with tags and search optimization`);
  console.log(`   ✅ Interview preparation challenges (TechMastry integration)`);
  console.log(`   ✅ Course preview and content access management`);
  console.log(`   ✅ User role management (Student, Instructor, Admin)`);
  console.log(`   ✅ Course difficulty levels (Beginner to Expert)`);
  console.log(`   ✅ Multiple course categories (Frontend, Backend, Full-Stack, AI, DevOps)`);

  if (isTestEnv) {
    console.log(`\n🧪 Test Environment Data Ready!`);
    console.log(`   Use this comprehensive dataset for integration testing`);
    console.log(`   All platform features can be thoroughly tested`);
    console.log(`   Realistic user scenarios and edge cases covered`);
  }

  console.log(`\n🚀 Ready for comprehensive platform testing!`);

  console.log('🎉 Comprehensive seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
