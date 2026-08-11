#!/usr/bin/env node
// Bootstraps .env from .env.example and generates a fresh WEBUI_SECRET_KEY.
// Safe to re-run: won't overwrite an existing .env, just fills in the key if missing/placeholder.

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error('.env.example not found — cannot bootstrap .env');
    process.exit(1);
  }
  fs.copyFileSync(examplePath, envPath);
  console.log('Created .env from .env.example');
}

let env = fs.readFileSync(envPath, 'utf8');
const key = crypto.randomBytes(32).toString('hex');
const placeholderPattern = /^WEBUI_SECRET_KEY=.*$/m;

if (/^WEBUI_SECRET_KEY=changeme/m.test(env) || !placeholderPattern.test(env)) {
  if (placeholderPattern.test(env)) {
    env = env.replace(placeholderPattern, `WEBUI_SECRET_KEY=${key}`);
  } else {
    env += `\nWEBUI_SECRET_KEY=${key}\n`;
  }
  fs.writeFileSync(envPath, env);
  console.log('Generated a new WEBUI_SECRET_KEY in .env');
} else {
  console.log('WEBUI_SECRET_KEY already set, leaving it as is');
}