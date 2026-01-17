const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const manifestPath = path.join(__dirname, '..', 'manifest.json');

const PROD_NAME = 'Bye Bye For You - X';
const DEV_NAME = '[Dev] Bye Bye For You - X';

if (!['dev', 'prod'].includes(mode)) {
  console.error('Usage: node set-name.js [dev|prod]');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const newName = mode === 'dev' ? DEV_NAME : PROD_NAME;

if (manifest.name === newName) {
  console.log(`Already in ${mode} mode: "${newName}"`);
  process.exit(0);
}

manifest.name = newName;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');

console.log(`Switched to ${mode} mode: "${newName}"`);
