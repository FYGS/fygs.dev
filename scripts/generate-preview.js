/**
 * @fileoverview Script to generate preview images of website pages for social media sharing.
 * This script uses Puppeteer to take high-quality screenshots of any page.
 * 
 * Usage:
 *   node scripts/generate-preview.js [options]
 * 
 * Options:
 *   --path       Path to capture (e.g., "/blog", "/projects") [default: "/"]
 *   --output     Output filename [default: "preview.png"]
 *   --width      Viewport width [default: 1200]
 *   --height     Viewport height [default: 630]
 *   --scale      Device scale factor [default: 2]
 *   --full       Capture full page [default: false]
 *   --wait       Wait time in ms after load [default: 1000]
 * 
 * Environment Variables:
 *   BASE_URL - Base URL to screenshot (default: http://localhost:3000)
 * 
 * @author Fernand SOUALO <fygs.dev@gmail.com>
 * @see {@link https://github.com/fygs/fygs.dev GitHub Repository}
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;

/**
 * Parse command line arguments into options object
 * @returns {Object} Parsed options
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    path: "/",
    output: "preview.png",
    width: 1200,
    height: 630,
    scale: 2,
    full: false,
    wait: 1000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--path":
        // Nettoyer le chemin des préfixes Git Bash
        options.path = nextArg
          .replace(/^C:\/Program Files\/Git\/?/, '')  // Supprimer le préfixe Git Bash
          .replace(/^\/?/, '');  // Assurer qu'il n'y a pas de slash initial
        i++;
        break;
      case "--output":
        options.output = nextArg;
        i++;
        break;
      case "--width":
        options.width = parseInt(nextArg, 10);
        i++;
        break;
      case "--height":
        options.height = parseInt(nextArg, 10);
        i++;
        break;
      case "--scale":
        options.scale = parseInt(nextArg, 10);
        i++;
        break;
      case "--full":
        options.full = true;
        break;
      case "--wait":
        options.wait = parseInt(nextArg, 10);
        i++;
        break;
      case "--help":
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Generate preview images of website pages.

Usage:
  node scripts/generate-preview.js [options]

Options:
  --path    Path to capture (e.g., "/blog", "/projects") [default: "/"]
  --output  Output filename [default: "preview.png"]
  --width   Viewport width [default: 1200]
  --height  Viewport height [default: 630]
  --scale   Device scale factor [default: 2]
  --full    Capture full page [default: false]
  --wait    Wait time in ms after load [default: 1000]
  --help    Show this help message

Environment:
  BASE_URL  Base URL to screenshot [default: http://localhost:3000]

Examples:
  # Capture homepage
  node scripts/generate-preview.js

  # Capture blog page
  node scripts/generate-preview.js --path /blog --output blog-preview.png

  # Capture full project page
  node scripts/generate-preview.js --path /projects --full --output project-preview.png

  # Custom dimensions
  node scripts/generate-preview.js --width 1600 --height 900 --output large-preview.png
`);
}

/**
 * Configuration builder for the preview generation
 * @param {Object} options - Command line options
 * @returns {Object} Configuration object
 */
function buildConfig(options) {
  // Toujours utiliser l'URL absolue
  const baseUrl = "http://localhost:3000";
  
  // Construire l'URL absolue
  const url = `${baseUrl}/${options.path}`;
  
  return {
    viewport: {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.scale,
    },
    output: {
      dir: path.join(__dirname, "..", "public", "images"),
      filename: options.output,
      type: path.extname(options.output).slice(1) || "png",
    },
    url,
    timeout: 30000,
    waitTime: options.wait,
    fullPage: options.full,
  };
}

/**
 * Ensures that the specified directory exists
 * @param {string} dirPath - Directory path to check/create
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generates a preview image of the specified page
 * @param {Object} options - Command line options
 */
async function generatePreview(options) {
  const config = buildConfig(options);
  
  console.log("\n🎨 Generating preview image...");
  console.log(`📍 URL: ${config.url}`);
  console.log(`📐 Size: ${config.viewport.width}x${config.viewport.height}`);
  console.log(`📱 Scale: ${config.viewport.deviceScaleFactor}x`);
  console.log(`📷 Mode: ${config.fullPage ? "Full page" : "Viewport only"}`);
  console.log(`⏲️ Wait time: ${config.waitTime}ms`);
  
  console.time("⏱️ Generation time");

  try {
    await ensureDirectoryExists(config.output.dir);

    const browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: config.viewport,
    });

    try {
      const page = await browser.newPage();

      const response = await page.goto(config.url, {
        waitUntil: ["networkidle0", "domcontentloaded"],
        timeout: config.timeout,
      });

      if (!response.ok()) {
        throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
      }

      // Attendre que le contenu principal soit chargé
      await page.waitForSelector('main', { timeout: config.timeout });
      
      // Attendre un peu plus pour les animations et le contenu dynamique
      await new Promise((resolve) => setTimeout(resolve, config.waitTime));

      const outputPath = path.join(config.output.dir, config.output.filename);
      await page.screenshot({
        path: outputPath,
        type: config.output.type,
        fullPage: config.fullPage,
      });

      const relativeOutputPath = path.relative(process.cwd(), outputPath);
      console.log(`\n✅ Preview saved to: ${relativeOutputPath}`);
      console.log(`💡 Size: ${(await fs.stat(outputPath)).size / 1024}KB`);
    } finally {
      await browser.close();
    }

    console.timeEnd("⏱️ Generation time");
  } catch (error) {
    console.error("\n❌ Error generating preview:", error.message);
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes("--help")) {
  showHelp();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  const options = parseArguments();
  generatePreview(options).catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}
