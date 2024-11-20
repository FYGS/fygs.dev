/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "..", "public", "images");

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateFavicons(input) {
  const sizes = {
    "android-chrome-512x512.png": 512,
    "android-chrome-192x192.png": 192,
    "apple-touch-icon.png": 180,
    "favicon-32x32.png": 32,
    "favicon-16x16.png": 16,
  };

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(input)
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(path.join(IMAGES_DIR, filename));
    console.log(`Generated ${filename}`);
  }
}

async function generateOgImage(input) {
  await sharp(input)
    .resize(1200, 630, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile(path.join(IMAGES_DIR, "og-image.png"));
  console.log("Generated og-image.png");
}

async function main() {
  await ensureDir(IMAGES_DIR);

  // Check if source image exists
  const sourceImage = process.argv[2];
  if (!sourceImage) {
    console.error("Please provide a source image path");
    process.exit(1);
  }

  try {
    await fs.access(sourceImage);
  } catch {
    console.error("Source image not found:", sourceImage);
    process.exit(1);
  }

  // Generate all images
  await generateFavicons(sourceImage);
  await generateOgImage(sourceImage);

  console.log("\nAll images generated successfully!");
  console.log("\nNext steps:");
  console.log(
    "1. Create safari-pinned-tab.svg manually (should be monochrome)"
  );
  console.log("2. Verify all images in public/images/");
  console.log("3. Update your verification tokens in .env.local");
}

main().catch(console.error);
