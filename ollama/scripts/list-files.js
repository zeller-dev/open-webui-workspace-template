#!/usr/bin/env node
// List .gguf files available in a Hugging Face repo. Restricted to trusted quantizers.
// Usage: node scripts/list-files.js <repo>
// Example: node scripts/list-files.js bartowski/Qwen3-14B-GGUF

const TRUSTED_NAMESPACES = ['bartowski', 'unsloth'];

const repo = process.argv[2];
const trustedPattern = new RegExp(`^(${TRUSTED_NAMESPACES.join('|')})/`);

if (!repo || !repo.includes('/')) {
  console.error('Usage: npm run list-files -- <owner/repo>');
  console.error('Example: npm run list-files -- bartowski/Llama-3.2-1B-Instruct-GGUF');
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
  const url = `https://huggingface.co/api/models/${repo}`;

  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error(`Network error: ${e.message}`);
    process.exitCode = 1;
    return;
  }

  if (!res.ok) {
    console.error(`Failed to fetch repo info: ${res.status} ${res.statusText}`);
    process.exitCode = 1;
    return;
  }
  const data = await res.json();
  const ggufFiles = (data.siblings || [])
    .map(s => s.rfilename)
    .filter(f => f.toLowerCase().endsWith('.gguf'));

  if (ggufFiles.length === 0) {
    console.log('No .gguf files found in this repo.');
    return;
  }

  console.log(`\n.gguf files in ${repo}:\n`);
  ggufFiles.forEach(f => console.log(`  ${f}`));
  console.log(`\nDownload one:`);
  console.log(`  npm run fetch -- ${repo} <filename>`);
}