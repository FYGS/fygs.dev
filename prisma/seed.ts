#!/usr/bin/env node

/**
 * FYGS Academy - Comprehensive Database Seed
 *
 * This script creates realistic, production-ready seed data for testing and development.
 * Includes all models with authentic content, proper relationships, and varied scenarios.
 *
 * Features:
 * - Real-world user profiles with Unsplash avatars
 * - Complete course catalog with detailed content
 * - Comprehensive review system with interactions
 * - Payment and subscription scenarios
 * - Rich progress tracking data
 * - Visual supports and quiz content
 * - Analytics-ready data patterns
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { runSeed } from "./seed/run";
import { assertSeedAllowed } from "./seed-guard";

// Before anything touches a database: demo accounts never go to a real one by accident
assertSeedAllowed();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

runSeed(prisma)
  .catch((e) => {
    console.error("💥 Fatal error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
