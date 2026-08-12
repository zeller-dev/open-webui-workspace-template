#!/usr/bin/env node
// Search Hugging Face for GGUF quantizations, restricted to trusted quantizers.
// Usage: node scripts/search-model.js <query>
// Example: node scripts/search-model.js "qwen3 14b"
// Use plain words, not Ollama-style tags — "llama 3.2 1b", not "llama3.2:1b"

const TRUSTED_NAMESPACES = ['bartowski', 'unsloth'];

const query = process.argv.slice(2).join(' ');
if (!query) {
  console.error('Usage: npm run search -- "<model name>"');
  process.exitCode = 1;
} else {
  main().catch(e => {
    console.error(`Error: ${e.message}`);
    process.exitCode = 1;
  });
}

async function main() {
  const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query + ' GGUF')}&limit=30&sort=downloads&direction=-1`;

  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error(`Network error: ${e.message}`);
    process.exitCode = 1;
    return;
  }

  if (!res.ok) {
    console.error(`Search failed: ${res.status} ${res.statusText}`);
    process.exitCode = 1;
    return;
  }
  const results = await res.json();

  const trustedPattern = new RegExp(`^(${TRUSTED_NAMESPACES.join('|')})/`);
  const trusted = results.filter(r => trustedPattern.test(r.id));

  if (trusted.length === 0) {
    console.log(`No results from trusted quantizers (${TRUSTED_NAMESPACES.join(', ')}) for "${query}".`);
    console.log('Try different wording — plain words work best, e.g. "llama 3.2 1b" not "llama3.2:1b".');
    return;
  }

  console.log(`\nResults for "${query}" (trusted quantizers only):\n`);
  trusted.slice(0, 12).forEach((r, i) => {
    console.log(`${i + 1}. ${r.id}  —  ${r.downloads?.toLocaleString() || '?'} downloads`);
  });

  console.log(`\nNext: list files in a repo:`);
  console.log(`  npm run list-files -- <repo>`);
  console.log(`Then download one:`);
  console.log(`  npm run fetch -- <repo> <filename>`);
}