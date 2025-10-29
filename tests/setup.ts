import { beforeAll, afterAll, beforeEach } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Setup test database before all tests
beforeAll(async () => {
  try {
    console.log("Setting up test environment...");

    // Check if Docker Compose services are running
    try {
      await execAsync("docker-compose -f docker-compose.test.yml ps");
      console.log("Docker Compose test services are running");
    } catch {
      console.log("Starting Docker Compose test services...");
      await execAsync("docker-compose -f docker-compose.test.yml up -d");
      // Wait for services to be ready
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    // Push the schema to test database
    await execAsync("dotenv -e .env.test -- npx prisma db push --force-reset");
    console.log("Test database schema pushed successfully");

    // Run any necessary seeds for basic test data
    // await execAsync('dotenv -e .env.test -- npx prisma db seed');
    // console.log('Test database seeded successfully');
  } catch (error) {
    console.error("Failed to setup test environment:", error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    console.log("Cleaning up test environment...");
    // Note: We don't stop Docker services here as they might be needed for other test runs
    // Use `pnpm test:teardown` to fully clean up
  } catch (error) {
    console.error("Failed to cleanup test environment:", error);
  }
});

// Clean database state before each test to ensure isolation
beforeEach(async () => {
  try {
    // Truncate all tables for test isolation
    // This is more reliable than trying to delete specific records
    await execAsync("dotenv -e .env.test -- npx prisma db push --force-reset");
  } catch (error) {
    console.warn("Failed to reset database between tests:", error);
    // Don't throw - let the test try to continue
  }
});
