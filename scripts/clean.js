const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const webuiDataPath = path.join(rootDir, 'data', 'webui');

console.log('🧹 Cleaning Open WebUI database and user state...\n');

// 1. Stop Docker containers
try {
  execSync('docker compose down', { stdio: 'inherit' });
} catch (error) {
  console.log('ℹ️ Docker containers were not running.');
}

// 2. Remove webui data directory
if (fs.existsSync(webuiDataPath)) {
  try {
    fs.rmSync(webuiDataPath, { recursive: true, force: true });
    console.log('\n✅ WebUI database cleared successfully (model weights in data/ollama preserved).');
  } catch (error) {
    console.error('\n❌ Failed to clean webui data directory:', error.message);
  }
} else {
  console.log('\nℹ️ No WebUI data found to clean.');
}

console.log('✨ Clean complete! Run "npm run setup" or "npm run up" to restart fresh.');