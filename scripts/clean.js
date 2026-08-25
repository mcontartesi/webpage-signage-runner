const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '..', 'dist');
const releasePath = path.resolve(__dirname, '..', 'release');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('[Clean] Removed dist directory.');
}

if (process.argv.includes('--all') && fs.existsSync(releasePath)) {
  fs.rmSync(releasePath, { recursive: true, force: true });
  console.log('[Clean] Removed release directory.');
}
