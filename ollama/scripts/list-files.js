#!/usr/bin/env node
// List .gguf files available in a Hugging Face repo.
// Usage: node scripts/list-files.js <repo>
// Example: node scripts/list-files.js bartowski/Qwen3-14B-GGUF

const repo = process.argv[2];
if (!repo) {
  console.error('Usage: npm run list-files -- <repo>');
  process.exit(1);
}

async function main() {
  const url = `https://huggingface.co/api/models/${repo}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch repo info: ${res.status} ${res.statusText}`);
    process.exit(1);
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

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});