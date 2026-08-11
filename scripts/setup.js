const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

// 1. Generate .env file
if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found.');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  const secretKey = crypto.randomBytes(32).toString('hex');

  envContent = envContent.replace(/your_generated_32_byte_hex_secret_here|WEBUI_SECRET_KEY=.*/, `WEBUI_SECRET_KEY=${secretKey}`);
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Created .env with generated WEBUI_SECRET_KEY.');
} else {
  console.log('ℹ️  .env file already exists.');
}

// 2. Start containers & pull/create models
try {
  console.log('\n🚀 Starting Docker containers...');
  execSync('docker compose up -d', { stdio: 'inherit' });

  console.log('\n📦 Pulling base model weights...');
  execSync('docker exec -i ollama ollama pull nomic-embed-text', { stdio: 'inherit' });
  execSync('docker exec -i ollama ollama pull llama3.2:1b', { stdio: 'inherit' });

  console.log('\n⚙️ Building custom workspace model (workspace-assistant)...');
  execSync('docker exec -i ollama ollama create workspace-assistant -f /scripts/Modelfile', { stdio: 'inherit' });

  console.log('\n✨ Setup complete! Everything pre-configured at http://localhost:3333');
} catch (error) {
  console.error('\n❌ Docker initialization failed:', error.message);
}