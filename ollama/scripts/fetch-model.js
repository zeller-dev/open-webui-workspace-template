#!/usr/bin/env node
// Download a .gguf file from Hugging Face directly into models/.
// Usage: node scripts/fetch-model.js <repo> <filename>
// Example: node scripts/fetch-model.js bartowski/Qwen3-14B-GGUF Qwen3-14B-Q4_K_M.gguf

const fs = require('fs');
const path = require('path');

const [repo, filename] = process.argv.slice(2);
if (!repo || !filename) {
  console.error('Usage: npm run fetch -- <repo> <filename>');
  process.exit(1);
}

async function main() {
  const url = `https://huggingface.co/${repo}/resolve/main/${filename}?download=true`;
  const dest = path.join(__dirname, '..', 'models', filename);

  console.log(`Downloading ${filename} from ${repo} ...`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    console.error(`Download failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const total = Number(res.headers.get('content-length') || 0);
  let received = 0;
  const fileStream = fs.createWriteStream(dest);

  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    fileStream.write(value);
    if (total) {
      const pct = ((received / total) * 100).toFixed(1);
      process.stdout.write(`\r  ${pct}%  (${(received / 1e9).toFixed(2)} GB / ${(total / 1e9).toFixed(2)} GB)`);
    }
  }
  fileStream.end();
  console.log(`\nSaved to models/${filename}`);
  console.log('Run `npm run auto-import` to import it into Ollama.');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});