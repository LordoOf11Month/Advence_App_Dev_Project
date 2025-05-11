const fs = require('fs');
const path = require('path');

// Function to create a simple SVG placeholder
function createPlaceholderSVG(width, height, text) {
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f5f5f5"/>
  <rect width="100%" height="100%" fill="none" stroke="#cccccc" stroke-width="2"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="#999999">
    ${text}
  </text>
</svg>
`.trim();
}

// Save the placeholder image
const imagesDir = path.join(__dirname, 'images');

// Create the directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create product placeholder
const productSvg = createPlaceholderSVG(300, 300, 'Product Image');
fs.writeFileSync(path.join(imagesDir, 'placeholder-product.svg'), productSvg);

console.log('Placeholder images generated successfully!'); 