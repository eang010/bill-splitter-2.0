const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 180, 192, 512];
const outputDir = path.join(__dirname, '../public');

// Create a simple SVG with a dollar sign
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3b82f6"/>
  <path d="M256 96v320M192 192h128M192 320h128" stroke="white" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons for each size
async function generateIcons() {
  try {
    // Create a base image from SVG
    const baseImage = sharp(Buffer.from(svg));

    for (const size of sizes) {
      const filename = size === 180 ? 'apple-touch-icon.png' :
                      size === 192 ? 'icon-192x192.png' :
                      size === 512 ? 'icon-512x512.png' :
                      `favicon-${size}x${size}.png`;

      const outputPath = path.join(outputDir, filename);
      
      // Clone the base image for each size to avoid memory issues
      await baseImage
        .clone()
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${filename}`);
    }
    
    console.log('All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
}

// Run the generator
generateIcons(); 