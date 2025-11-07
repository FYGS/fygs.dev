const fs = require('fs');
const path = require('path');

// Dynamically import sharp
async function resizeScreenshots() {
  const sharp = await import('sharp');

  // Define the required sizes for screenshots
  const screenshotSizes = {
    'home-desktop.png': { width: 1200, height: 630 },
    'home-mobile.png': { width: 1080, height: 1920 },
    'formations.png': { width: 96, height: 96 },
    'blog.png': { width: 96, height: 96 },
    'community.png': { width: 96, height: 96 },
    'dashboard.png': { width: 96, height: 96 }
  };

  async function resizeImage(inputPath, outputPath, width, height) {
    try {
      await sharp.default(inputPath)
        .resize(width, height, {
          fit: 'cover', // Ensures the entire area is filled
          position: 'center' // Centers the image when cropping
        })
        .png() // Ensure output is PNG
        .toFile(outputPath);
      
      console.log(`✓ Resized ${inputPath} to ${width}x${height} -> ${outputPath}`);
    } catch (error) {
      console.error(`✗ Error resizing ${inputPath}:`, error.message);
    }
 }

  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  
  // Check if screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    console.error('Error: public/screenshots directory does not exist');
    return;
  }

  // Get all PNG files in the screenshots directory
  const files = fs.readdirSync(screenshotsDir).filter(file => 
    file.toLowerCase().endsWith('.png')
  );

  console.log('Resizing screenshots to match manifest requirements...\n');

  // Process each file
  for (const file of files) {
    const inputPath = path.join(screenshotsDir, file);
    
    // Check if this file has a required size in the manifest
    if (screenshotSizes[file]) {
      const { width, height } = screenshotSizes[file];
      const outputPath = path.join(screenshotsDir, `${file.replace('.png', `-${width}x${height}.png`)}`);
      
      await resizeImage(inputPath, outputPath, width, height);
    } else {
      console.log(`- Skipping ${file} (no specific size requirement in manifest)`);
    }
  }

  console.log('\nScreenshot resizing complete!');
}

// Run the script
resizeScreenshots().catch(console.error);