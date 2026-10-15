/**
 * Generate missing PWA assets (96x96 icon and mobile screenshot)
 * Run with: node scripts/generate-pwa-assets.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imagesDir = path.join(__dirname, "..", "public", "images");

async function generateAssets() {
  console.log("🎨 Generating PWA assets...\n");

  try {
    // 1. Generate 96x96 icon from 192x192
    const source192 = path.join(imagesDir, "android-chrome-192x192.png");
    const output96 = path.join(imagesDir, "icon-96x96.png");

    if (!fs.existsSync(source192)) {
      throw new Error(`Source icon not found: ${source192}`);
    }

    await sharp(source192)
      .resize(96, 96, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(output96);

    console.log("✅ Generated 96x96 icon: icon-96x96.png");

    // 2. Generate mobile screenshot (portrait 9:16 ratio)
    // We'll create a composite image with the OG image centered
    const ogImage = path.join(imagesDir, "og-image.png");
    const mobileScreenshot = path.join(imagesDir, "screenshot-mobile.png");

    if (!fs.existsSync(ogImage)) {
      console.warn(
        "⚠️  OG image not found, skipping mobile screenshot generation"
      );
    } else {
      // Create a 1080x1920 mobile screenshot (9:16 ratio)
      const mobileWidth = 1080;
      const mobileHeight = 1920;

      // First, get OG image info
      const ogInfo = await sharp(ogImage).metadata();

      // Resize OG image to fit within mobile screenshot while maintaining aspect ratio
      const scaleFactor = Math.min(
        (mobileWidth * 0.9) / ogInfo.width,
        (mobileHeight * 0.4) / ogInfo.height
      );

      const resizedWidth = Math.floor(ogInfo.width * scaleFactor);
      const resizedHeight = Math.floor(ogInfo.height * scaleFactor);

      const resizedOg = await sharp(ogImage)
        .resize(resizedWidth, resizedHeight, { fit: "contain" })
        .toBuffer();

      // Create mobile screenshot with gradient background
      await sharp({
        create: {
          width: mobileWidth,
          height: mobileHeight,
          channels: 4,
          background: { r: 41, g: 51, b: 61, alpha: 1 }, // --background dark theme
        },
      })
        .composite([
          {
            input: resizedOg,
            top: Math.floor((mobileHeight - resizedHeight) / 3),
            left: Math.floor((mobileWidth - resizedWidth) / 2),
          },
        ])
        .png()
        .toFile(mobileScreenshot);

      console.log("✅ Generated mobile screenshot: screenshot-mobile.png");
    }

    console.log("\n✨ PWA assets generation complete!");
    console.log("\nGenerated files:");
    console.log("  - /images/icon-96x96.png (for shortcuts)");
    console.log("  - /images/screenshot-mobile.png (for app stores)");
    console.log("\n📝 Next steps:");
    console.log("  1. The manifest.ts has been updated to use these assets");
    console.log("  2. Test the PWA with: pnpm dev");
    console.log("  3. Run Lighthouse audit to verify PWA criteria\n");
  } catch (error) {
    console.error("❌ Error generating assets:", error.message);
    process.exit(1);
  }
}

// Check if sharp is available
try {
  require.resolve("sharp");
  generateAssets();
} catch {
  console.error("❌ Sharp is not installed. Installing now...");
  console.log("Run: pnpm add -D sharp");
  console.log(
    "Then run this script again: node scripts/generate-pwa-assets.js"
  );
  process.exit(1);
}
