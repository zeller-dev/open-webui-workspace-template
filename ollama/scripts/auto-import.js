#!/usr/bin/env node
// Scans models/ for .gguf files, generates a matching Modelfile for any that
// don't have one yet, then imports each into Ollama via `docker exec`.
// Safe to re-run: skips files that already have a Modelfile and are already
// imported.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const modelsDir = path.join(__dirname, '..', 'models');

if (!fs.existsSync(modelsDir)) {
  console.error('models/ folder not found');
  process.exit(1);
}

const ggufFiles = fs.readdirSync(modelsDir).filter(f => f.toLowerCase().endsWith('.gguf'));

if (ggufFiles.length === 0) {
  console.log('No .gguf files found in models/');
  process.exit(0);
}

// Get already-imported model names so we don't re-run unnecessarily
let existing = new Set();
try {
  const out = execFileSync('docker', ['exec', 'ollama', 'ollama', 'list'], { encoding: 'utf8' });
  out.split('\n').slice(1).forEach(line => {
    // `ollama list` prints "name:tag" (e.g. "foo:latest"), but `ollama
    // create` below is always called without an explicit tag — strip it so
    // the comparison actually matches.
    const name = line.trim().split(/\s+/)[0]?.replace(/:latest$/, '');
    if (name) existing.add(name);
  });
} catch (e) {
  console.error('Could not reach the ollama container. Is the stack running? Try `npm run up` first.');
  process.exit(1);
}

for (const gguf of ggufFiles) {
  const base = gguf.replace(/\.gguf$/i, '');
  // Model name: lowercase, spaces/underscores -> hyphens, strip anything
  // that isn't alphanumeric/hyphen/dot/colon (Ollama naming rules)
  const modelName = base
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9.\-:]/g, '');

  const modelfilePath = path.join(modelsDir, `${base}.Modelfile`);

  if (!fs.existsSync(modelfilePath)) {
    fs.writeFileSync(modelfilePath, `FROM /models/${gguf}\n`);
    console.log(`Created ${base}.Modelfile`);
  }

  if (existing.has(modelName)) {
    console.log(`${modelName} already imported, skipping`);
    continue;
  }

  console.log(`Importing ${modelName} from ${gguf} ...`);
  try {
    execFileSync(
      'docker',
      ['exec', 'ollama', 'ollama', 'create', modelName, '-f', `/models/${base}.Modelfile`],
      { stdio: 'inherit' }
    );
    console.log(`Imported: ${modelName}`);
  } catch (e) {
    console.error(`Failed to import ${modelName}:`, e.message);
  }
}