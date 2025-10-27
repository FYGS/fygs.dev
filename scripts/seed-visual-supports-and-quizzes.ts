#!/usr/bin/env node

/**
 * Script to seed example visual supports and quizzes for courses
 * This script creates sample data based on the example provided in the user's request
 */

import { PrismaClient } from "@prisma/client";
import { visualSupportsContent } from "../lib/loaders/visual-supports-content";

const prisma = new PrismaClient();

async function seedVisualSupportsAndQuizzes() {
  try {
    console.log("Starting to seed visual supports and quizzes...");

    // Find a Next.js course to seed data for
    const nextJsCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { title: { contains: "Next.js 15", mode: "insensitive" } },
          { slug: { contains: "next", mode: "insensitive" } },
        ],
      },
    });

    if (!nextJsCourse) {
      console.log(
        "No Next.js course found. Creating sample data for a new course..."
      );

      // Create a sample Next.js course if none exists
      const course = await prisma.course.create({
        data: {
          title:
            "Next.js 16 de A à Z: Devenez un expert du développement fullstack moderne",
          slug: "nextjs-16-de-a-z-devenez-un-expert-du-developpement-fullstack-moderne",
          description:
            "Formation complète sur Next.js 16 pour devenir un expert du développement fullstack moderne",
          category: "FULLSTACK",
          level: "INTERMEDIATE",
          published: true,
          featured: true,
          accessTier: "FREE",
          previewEnabled: true,
          price: 0,
        },
      });

      console.log(`Created course: ${course.title}`);

      // Create modules for the course
      const modules = await Promise.all([
        prisma.module.create({
          data: {
            courseId: course.id,
            title: "Module 1 : Fondations & Écosystème",
            slug: "module-1-fondations-ecosysteme",
            order: 1,
          },
        }),
        prisma.module.create({
          data: {
            courseId: course.id,
            title: "Module 2 : App Router Avancé",
            slug: "module-2-app-router-avance",
            order: 2,
          },
        }),
      ]);

      console.log(`Created ${modules.length} modules for the course`);

      // Create sample lessons for each module
      const lessons = await Promise.all([
        prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: modules[0].id,
            title: "Introduction à Next.js 16",
            slug: "introduction-a-nextjs-16",
            description: "Découverte de Next.js 16 et de ses nouveautés",
            order: 1,
            published: true,
          },
        }),
        prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: modules[0].id,
            title: "Configuration de l'environnement",
            slug: "configuration-de-lenvironnement",
            description:
              "Installation et configuration de l'environnement de développement",
            order: 2,
            published: true,
          },
        }),
        prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: modules[1].id,
            title: "Routing avancé avec App Router",
            slug: "routing-avance-avec-app-router",
            description:
              "Techniques avancées de routing avec l'App Router de Next.js",
            order: 1,
            published: true,
          },
        }),
        prisma.lesson.create({
          data: {
            courseId: course.id,
            moduleId: modules[1].id,
            title: "Server Components et Client Components",
            slug: "server-components-et-client-components",
            description:
              "Comprendre la différence entre Server Components et Client Components",
            order: 2,
            published: true,
          },
        }),
      ]);

      console.log(`Created ${lessons.length} lessons for the course`);

      // Create visual supports for the course
      const visualSupports = await Promise.all([
        prisma.visualSupport.create({
          data: {
            courseId: course.id,
            moduleId: 1,
            title: "L'Évolution du Rendu Web",
            content: {
              slides: [
                {
                  title: "L'Évolution du Rendu Web",
                  content: visualSupportsContent.nextjsEvolution,
                },
              ],
            },
            order: 1,
          },
        }),
        prisma.visualSupport.create({
          data: {
            courseId: course.id,
            moduleId: 2,
            title: "Architecture Next.js App Router",
            content: {
              slides: [
                {
                  title: "Architecture Next.js App Router",
                  content: visualSupportsContent.nextjsArchitecture,
                },
              ],
            },
            order: 1,
          },
        }),
      ]);

      console.log(
        `Created ${visualSupports.length} visual supports for the course`
      );

      // Create quizzes for the course
      const quizzes = await Promise.all([
        prisma.quiz.create({
          data: {
            courseId: course.id,
            moduleId: 1,
            title: "Module 1 : Fondations & Écosystème",
            questions: {
              create: [
                {
                  question:
                    "Quelle est la principale innovation de Next.js par rapport à Create React App ?",
                  options: [
                    "Support natif de TypeScript",
                    "Rendu hybride (SSR, SSG, CSR) selon les besoins",
                    "Meilleure gestion du CSS",
                    "Plus rapide à installer",
                  ],
                  correct: 1,
                  explanation:
                    "Next.js permet de choisir la stratégie de rendu (SSR, SSG, ISR, CSR) page par page, offrant ainsi flexibilité et performance optimale selon les besoins.",
                  order: 1,
                },
                {
                  question:
                    "Dans l'App Router de Next.js, quel est le comportement par défaut des composants ?",
                  options: [
                    "Ce sont des Client Components",
                    "Ce sont des Server Components",
                    "Cela dépend de l'extension du fichier",
                    "Il faut toujours spécifier explicitement",
                  ],
                  correct: 1,
                  explanation:
                    "Par défaut, tous les composants dans l'App Router sont des Server Components. Il faut utiliser la directive 'use client' pour créer un Client Component.",
                  order: 2,
                },
              ],
            },
          },
        }),
        prisma.quiz.create({
          data: {
            courseId: course.id,
            moduleId: 2,
            title: "Module 2 : App Router Avancé",
            questions: {
              create: [
                {
                  question:
                    "Quelle syntaxe permet de créer une Parallel Route dans Next.js ?",
                  options: [
                    "parallel/route.tsx",
                    "@slot/page.tsx",
                    "(parallel)/page.tsx",
                    "parallel-route.tsx",
                  ],
                  correct: 1,
                  explanation:
                    "Les Parallel Routes utilisent la convention @nom pour créer des slots qui peuvent être rendus simultanément dans un layout parent.",
                  order: 1,
                },
              ],
            },
          },
        }),
      ]);

      console.log(`Created ${quizzes.length} quizzes for the course`);

      console.log("✅ Seeding completed successfully!");
    } else {
      console.log(`Found existing Next.js course: ${nextJsCourse.title}`);

      // Check if visual supports already exist for this course
      const existingVisualSupports = await prisma.visualSupport.findMany({
        where: { courseId: nextJsCourse.id },
      });

      if (existingVisualSupports.length === 0) {
        console.log("Creating visual supports for existing course...");

        // Create visual supports for the existing course
        const visualSupports = await Promise.all([
          prisma.visualSupport.create({
            data: {
              courseId: nextJsCourse.id,
              moduleId: 1,
              title: "L'Évolution du Rendu Web",
              content: {
                slides: [
                  {
                    title: "L'Évolution du Rendu Web",
                    content: visualSupportsContent.nextjsEvolution,
                  },
                ],
              },
              order: 1,
            },
          }),
          prisma.visualSupport.create({
            data: {
              courseId: nextJsCourse.id,
              moduleId: 2,
              title: "Architecture Next.js App Router",
              content: {
                slides: [
                  {
                    title: "Architecture Next.js App Router",
                    content: visualSupportsContent.nextjsArchitecture,
                  },
                ],
              },
              order: 1,
            },
          }),
        ]);

        console.log(
          `Created ${visualSupports.length} visual supports for the course`
        );
      } else {
        console.log("Visual supports already exist for this course.");
      }

      // Check if quizzes already exist for this course
      const existingQuizzes = await prisma.quiz.findMany({
        where: { courseId: nextJsCourse.id },
      });

      if (existingQuizzes.length === 0) {
        console.log("Creating quizzes for existing course...");

        // Create quizzes for the existing course
        const quizzes = await Promise.all([
          prisma.quiz.create({
            data: {
              courseId: nextJsCourse.id,
              moduleId: 1,
              title: "Module 1 : Fondations & Écosystème",
              questions: {
                create: [
                  {
                    question:
                      "Quelle est la principale innovation de Next.js par rapport à Create React App ?",
                    options: [
                      "Support natif de TypeScript",
                      "Rendu hybride (SSR, SSG, CSR) selon les besoins",
                      "Meilleure gestion du CSS",
                      "Plus rapide à installer",
                    ],
                    correct: 1,
                    explanation:
                      "Next.js permet de choisir la stratégie de rendu (SSR, SSG, ISR, CSR) page par page, offrant ainsi flexibilité et performance optimale selon les besoins.",
                    order: 1,
                  },
                  {
                    question:
                      "Dans l'App Router de Next.js, quel est le comportement par défaut des composants ?",
                    options: [
                      "Ce sont des Client Components",
                      "Ce sont des Server Components",
                      "Cela dépend de l'extension du fichier",
                      "Il faut toujours spécifier explicitement",
                    ],
                    correct: 1,
                    explanation:
                      "Par défaut, tous les composants dans l'App Router sont des Server Components. Il faut utiliser la directive 'use client' pour créer un Client Component.",
                    order: 2,
                  },
                ],
              },
            },
          }),
          prisma.quiz.create({
            data: {
              courseId: nextJsCourse.id,
              moduleId: 2,
              title: "Module 2 : App Router Avancé",
              questions: {
                create: [
                  {
                    question:
                      "Quelle syntaxe permet de créer une Parallel Route dans Next.js ?",
                    options: [
                      "parallel/route.tsx",
                      "@slot/page.tsx",
                      "(parallel)/page.tsx",
                      "parallel-route.tsx",
                    ],
                    correct: 1,
                    explanation:
                      "Les Parallel Routes utilisent la convention @nom pour créer des slots qui peuvent être rendus simultanément dans un layout parent.",
                    order: 1,
                  },
                ],
              },
            },
          }),
        ]);

        console.log(`Created ${quizzes.length} quizzes for the course`);
      } else {
        console.log("Quizzes already exist for this course.");
      }

      console.log("✅ Seeding completed successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedVisualSupportsAndQuizzes();
