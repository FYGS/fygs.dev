#!/usr/bin/env node

/**
 * Comprehensive test runner for review system
 * Executes all test categories with proper reporting
 */

import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Test categories configuration
const testCategories = {
  unit: {
    name: "Unit Tests",
    pattern: "tests/reviews/unit/**/*.test.ts",
    timeout: 30000,
    coverage: true,
  },
  integration: {
    name: "Integration Tests",
    pattern: "tests/reviews/integration/**/*.test.ts",
    timeout: 60000,
    coverage: true,
  },
  performance: {
    name: "Performance Tests",
    pattern: "tests/reviews/performance/**/*.test.ts",
    timeout: 120000,
    coverage: false,
  },
  e2e: {
    name: "End-to-End Tests",
    pattern: "tests/reviews/e2e/**/*.spec.ts",
    timeout: 300000,
    coverage: false,
    command: "playwright",
  },
};

// Test execution configuration
const config = {
  parallel: process.env.CI ? false : true,
  watch: process.argv.includes("--watch"),
  coverage: process.argv.includes("--coverage"),
  verbose: process.argv.includes("--verbose"),
  category: process.argv
    .find((arg) => arg.startsWith("--category="))
    ?.split("=")[1],
  bail: process.argv.includes("--bail"),
};

/**
 * Main test runner function
 */
async function runTests() {
  console.log("🧪 Review System Test Runner");
  console.log("=".repeat(50));
  console.log(`Configuration:`);
  console.log(`  Parallel: ${config.parallel}`);
  console.log(`  Watch: ${config.watch}`);
  console.log(`  Coverage: ${config.coverage}`);
  console.log(`  Category: ${config.category || "all"}`);
  console.log("");

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    totalTime: 0,
    categories: {},
  };

  // Determine which categories to run
  const categoriesToRun = config.category
    ? [config.category]
    : Object.keys(testCategories);

  // Validate category selection
  const invalidCategories = categoriesToRun.filter(
    (cat) => !testCategories[cat]
  );
  if (invalidCategories.length > 0) {
    console.error(
      `❌ Invalid test categories: ${invalidCategories.join(", ")}`
    );
    console.error(
      `Available categories: ${Object.keys(testCategories).join(", ")}`
    );
    process.exit(1);
  }

  // Pre-test setup
  await setupTestEnvironment();

  // Run each test category
  for (const category of categoriesToRun) {
    const categoryConfig = testCategories[category];
    console.log(`\n📋 Running ${categoryConfig.name}...`);
    console.log("-".repeat(30));

    const startTime = Date.now();
    const result = await runTestCategory(category, categoryConfig);
    const endTime = Date.now();
    const duration = endTime - startTime;

    results.categories[category] = {
      ...result,
      duration,
    };

    results.passed += result.passed;
    results.failed += result.failed;
    results.skipped += result.skipped;
    results.totalTime += duration;

    // Report category results
    console.log(`\n📊 ${categoryConfig.name} Results:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    console.log(`  ⏭️  Skipped: ${result.skipped}`);
    console.log(`  ⏱️  Duration: ${duration}ms`);

    // Bail on first failure if configured
    if (config.bail && result.failed > 0) {
      console.log(`\n🛑 Bailing on first failure as requested`);
      break;
    }
  }

  // Post-test cleanup
  await cleanupTestEnvironment();

  // Final report
  printFinalReport(results);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Setup test environment
 */
async function setupTestEnvironment() {
  console.log("🔧 Setting up test environment...");

  // Check for required dependencies
  const requiredDeps = ["vitest", "@vitest/coverage-v8"];
  const missingDeps = [];

  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
    } catch {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    console.error(
      `❌ Missing required dependencies: ${missingDeps.join(", ")}`
    );
    console.error("Please run: npm install");
    process.exit(1);
  }

  // Create test directories if they don't exist
  const testDirs = [
    "tests/reviews/reports",
    "tests/reviews/coverage",
    "tests/reviews/tmp",
  ];

  for (const dir of testDirs) {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  console.log("✅ Test environment ready");
}

/**
 * Run tests for a specific category
 */
async function runTestCategory(category, categoryConfig) {
  return new Promise((resolve) => {
    const args = buildTestCommand(category, categoryConfig);
    const command = categoryConfig.command === "playwright" ? "npx" : "npx";
    const fullArgs =
      categoryConfig.command === "playwright"
        ? ["playwright", "test", ...args]
        : ["vitest", ...args];

    console.log(`🚀 Command: ${command} ${fullArgs.join(" ")}`);

    const child = spawn(command, fullArgs, {
      stdio: "pipe",
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "test",
        FORCE_COLOR: "1",
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      if (config.verbose) {
        process.stdout.write(output);
      }
    });

    child.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      if (config.verbose) {
        process.stderr.write(output);
      }
    });

    child.on("close", (code) => {
      const result = parseTestOutput(stdout, stderr, category);
      result.exitCode = code;
      resolve(result);
    });

    child.on("error", (error) => {
      console.error(`❌ Failed to run ${category} tests:`, error.message);
      resolve({
        passed: 0,
        failed: 1,
        skipped: 0,
        exitCode: 1,
        error: error.message,
      });
    });
  });
}

/**
 * Build test command arguments
 */
function buildTestCommand(category, categoryConfig) {
  const args = [];

  if (categoryConfig.command === "playwright") {
    // Playwright specific arguments
    args.push(categoryConfig.pattern);
    if (config.verbose) args.push("--reporter=list");
    return args;
  }

  // Vitest arguments
  args.push("run");
  args.push(categoryConfig.pattern);

  if (config.coverage && categoryConfig.coverage) {
    args.push("--coverage");
  }

  if (config.watch) {
    args.push("--watch");
  }

  if (config.verbose) {
    args.push("--reporter=verbose");
  }

  args.push(`--testTimeout=${categoryConfig.timeout}`);

  return args;
}

/**
 * Parse test output to extract results
 */
function parseTestOutput(stdout, stderr, category) {
  const defaultResult = {
    passed: 0,
    failed: 0,
    skipped: 0,
    output: stdout,
    errors: stderr,
  };

  try {
    // Parse Vitest output
    if (category !== "e2e") {
      const testMatches = stdout.match(/(\d+) passed/);
      const failMatches = stdout.match(/(\d+) failed/);
      const skipMatches = stdout.match(/(\d+) skipped/);

      return {
        passed: testMatches ? parseInt(testMatches[1]) : 0,
        failed: failMatches ? parseInt(failMatches[1]) : 0,
        skipped: skipMatches ? parseInt(skipMatches[1]) : 0,
        output: stdout,
        errors: stderr,
      };
    }

    // Parse Playwright output
    const playwrightMatches = stdout.match(/(\d+) passed.*?(\d+) failed/);
    if (playwrightMatches) {
      return {
        passed: parseInt(playwrightMatches[1]),
        failed: parseInt(playwrightMatches[2]),
        skipped: 0,
        output: stdout,
        errors: stderr,
      };
    }

    return defaultResult;
  } catch (error) {
    console.warn(
      `⚠️  Failed to parse test output for ${category}:`,
      error.message
    );
    return defaultResult;
  }
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment() {
  console.log("\n🧹 Cleaning up test environment...");

  // Remove temporary files
  const tmpDir = path.resolve("tests/reviews/tmp");
  if (fs.existsSync(tmpDir)) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`⚠️  Failed to cleanup tmp directory:`, error.message);
    }
  }

  console.log("✅ Cleanup complete");
}

/**
 * Print comprehensive final report
 */
function printFinalReport(results) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL TEST REPORT");
  console.log("=".repeat(60));

  console.log(`\n🎯 Overall Results:`);
  console.log(`  ✅ Total Passed: ${results.passed}`);
  console.log(`  ❌ Total Failed: ${results.failed}`);
  console.log(`  ⏭️  Total Skipped: ${results.skipped}`);
  console.log(`  ⏱️  Total Duration: ${results.totalTime}ms`);

  const total = results.passed + results.failed + results.skipped;
  const successRate =
    total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  console.log(`  📈 Success Rate: ${successRate}%`);

  console.log(`\n📋 Category Breakdown:`);
  for (const [category, result] of Object.entries(results.categories)) {
    const categoryTotal = result.passed + result.failed + result.skipped;
    const categoryRate =
      categoryTotal > 0
        ? ((result.passed / categoryTotal) * 100).toFixed(1)
        : 0;

    console.log(`  ${testCategories[category].name}:`);
    console.log(
      `    ✅ ${result.passed} ❌ ${result.failed} ⏭️ ${result.skipped} (${categoryRate}%)`
    );
    console.log(`    ⏱️  ${result.duration}ms`);
  }

  // Performance insights
  if (results.totalTime > 60000) {
    console.log(
      `\n⚠️  Tests took longer than 1 minute. Consider optimization.`
    );
  }

  // Success/failure summary
  if (results.failed === 0) {
    console.log(`\n🎉 All tests passed! Great job! 🎉`);
  } else {
    console.log(
      `\n💥 ${results.failed} test(s) failed. Please review and fix.`
    );
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🧪 Review System Test Runner

Usage: node test-runner.js [options]

Options:
  --category=<name>    Run specific test category (unit|integration|performance|e2e)
  --coverage          Generate coverage reports
  --watch             Run tests in watch mode
  --verbose           Show detailed output
  --bail              Stop on first failure
  --help              Show this help message

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js --category=unit    # Run only unit tests
  node test-runner.js --coverage         # Run with coverage
  node test-runner.js --watch            # Run in watch mode
  node test-runner.js --bail --verbose   # Stop on failure with verbose output

Test Categories:
  unit         - Fast isolated unit tests
  integration  - API and service integration tests
  performance  - Load and performance tests
  e2e          - End-to-end browser tests
`);
}

// Handle help request
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("\n💥 Uncaught Exception:", error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("\n💥 Unhandled Rejection:", error);
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  console.error("\n💥 Test runner failed:", error.message);
  console.error(error.stack);
  process.exit(1);
});
