const fs = require('fs');
const path = require('path');

// SVG icon template with ShopHub branding
const createSvgIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.15}) scale(${size / 100})">
    <path d="M30 10C30 6 27 3 23 3H7C3 3 0 6 0 10V50C0 54 3 57 7 57H23C27 57 30 54 30 50V10Z" fill="white" opacity="0.9"/>
    <path d="M25 15H5V45H25V15Z" fill="#2563eb"/>
    <path d="M15 0V8" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <circle cx="15" cy="35" r="8" fill="white"/>
    <path d="M12 35L14 37L18 33" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M35 20L55 20" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <path d="M35 30L50 30" stroke="white" stroke-width="4" stroke-linecap="round"/>
    <path d="M35 40L45 40" stroke="white" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (browsers will render them properly)
sizes.forEach(size => {
  const svg = createSvgIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

// Also create a simple PNG placeholder using base64 encoded minimal PNG
// In production, you'd use sharp or canvas to generate proper PNGs
const createPlaceholderPng = (size) => {
  // Create a simple colored square as placeholder
  // This is a minimal valid PNG
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, // 8-bit RGB
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0x38, 0x60, 0xC0, 0x00, 0x00, 0x00, 0x49, 0x00, 0x01, // blue pixel data
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
};

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  fs.writeFileSync(path.join(iconsDir, filename), createPlaceholderPng(size));
  console.log(`Generated ${filename} (placeholder)`);
});

console.log('\\nPWA icons generated successfully!');
console.log('Note: For production, replace PNG placeholders with properly sized images.');
