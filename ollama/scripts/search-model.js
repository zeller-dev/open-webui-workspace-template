#!/usr/bin/env node
// Search Hugging Face for GGUF quantizations of a model.
// Usage: node scripts/search-model.js <query>
// Example: node scripts/search-model.js "qwen3 14b"

const query = process.argv.slice(2).join(' ');
if (!query) {
  console.error('Usage: npm run search -- "<model name>"');
  process.exit(1);
}

async function main() {
  const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query + ' GGUF')}&limit=15&sort=downloads&direction=-1`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Search failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const results = await res.json();

  // Prefer the well-known quantizers, but show everything found
  const trusted = results.filter(r => /^(bartowski|unsloth)\//.test(r.id));
  const others = results.filter(r => !/^(bartowski|unsloth)\//.test(r.id));
  const ordered = [...trusted, ...others];

  if (ordered.length === 0) {
    console.log('No results. Try a shorter/different query.');
    return;
  }

  console.log(`\nResults for "${query}":\n`);
  ordered.slice(0, 12).forEach((r, i) => {
    const tag = /^(bartowski|unsloth)\//.test(r.id) ? '  (trusted quantizer)' : '';
    console.log(`${i + 1}. ${r.id}${tag}  —  ${r.downloads?.toLocaleString() || '?'} downloads`);
  });

  console.log(`\nNext: list files in a repo:`);
  console.log(`  npm run list-files -- <repo>`);
  console.log(`Then download one:`);
  console.log(`  npm run fetch -- <repo> <filename>`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});