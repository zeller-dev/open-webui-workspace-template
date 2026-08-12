#!/usr/bin/env node
// Download a .gguf file from Hugging Face directly into models/. Restricted
// to trusted quantizers.
// Usage: node scripts/fetch-model.js <repo> <filename>
// Example: node scripts/fetch-model.js bartowski/Qwen3-14B-GGUF Qwen3-14B-Q4_K_M.gguf
//
// repo must be the FULL path (owner/repo-name), not just the owner.
// Not sure of the filename? Run list-files first:
//   npm run list-files -- <repo>

const fs = require('fs');
const path = require('path');

const TRUSTED_NAMESPACES = ['bartowski', 'unsloth'];
const trustedPattern = new RegExp(`^(${TRUSTED_NAMESPACES.join('|')})/`);

const [repo, filename] = process.argv.slice(2);

if (!repo || !filename || !repo.includes('/')) {
  console.error('Usage: npm run fetch -- <owner/repo> <filename>');
  console.error('Example: npm run fetch -- bartowski/Llama-3.2-1B-Instruct-GGUF Llama-3.2-1B-Instruct-Q4_K_M.gguf');
  console.error('Not sure of the exact repo/filename? Run: npm run list-files -- <owner/repo>');
  process.exitCode = 1;
} else if (!trustedPattern.test(repo)) {
  console.error(`Refusing: "${repo}" isn't from a trusted quantizer.`);
  console.error(`Only these namespaces are allowed: ${TRUSTED_NAMESPACES.join(', ')}`);
  console.error('Run `npm run search -- "<model name>"` to find a trusted repo.');
  process.exitCode = 1;
} else {
  main().catch(e => {
    console.error(`Error: ${e.message}`);
    process.exitCode = 1;
  });
}

async function main() {
  const url = `https://huggingface.co/${repo}/resolve/main/${filename}?download=true`;
  const dest = path.join(__dirname, '..', 'models', filename);

  console.log(`Downloading ${filename} from ${repo} ...`);

  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (e) {
    console.error(`Network error: ${e.message}`);
    process.exitCode = 1;
    return;
  }

  if (!res.ok || !res.body) {
    console.error(`Download failed: ${res.status} ${res.statusText}`);
    if (res.status === 401 || res.status === 404) {
      console.error('Check the repo path and filename are exactly right — try `npm run list-files -- ' + repo + '` to confirm.');
    }
    process.exitCode = 1;
    return;
  }

  const total = Number(res.headers.get('content-length') || 0);
  let received = 0;
  const fileStream = fs.createWriteStream(dest);

  try {
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
    await new Promise((resolve, reject) => {
      fileStream.end(err => (err ? reject(err) : resolve()));
    });
    console.log(`\nSaved to models/${filename}`);
    console.log('Run `npm run auto-import` to import it into Ollama.');
  } catch (e) {
    console.error(`\nDownload interrupted: ${e.message}`);
    process.exitCode = 1;
  }
}