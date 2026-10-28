#!/usr/bin/env node
// bgcreate — interactive manifest generator
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { sha256File, download } = require('./download');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

async function hashUrl(url) {
  const tmp = path.join(require('os').tmpdir(), 'bgcreate-' + Date.now());
  process.stdout.write(`downloading ${url}... `);
  await download(url, tmp);
  const sha = sha256File(tmp);
  fs.unlinkSync(tmp);
  console.log('ok');
  return sha;
}

async function create() {
  console.log('\n=== bgcreate — Bro Gang manifest generator ===\n');

  const name = await ask('Package name (e.g. ripgrep): ');
  const version = await ask('Version (e.g. 14.1.0): ');
  const description = await ask('Description: ');
  const homepage = await ask('Homepage URL: ');
  const url = await ask('Windows x64 download URL: ');
  const extract = await ask('Extract type [zip|msi] (zip): ') || 'zip';

  let bins = '';
  if (extract === 'zip') {
    bins = await ask('Binaries inside zip (from|to, comma-separated, e.g. rg.exe|rg.exe): ');
  }

  const sha = await hashUrl(url);

  const toml = [
    `name = "${name}"`,
    `version = "${version}"`,
    `description = "${description}"`,
    `homepage = "${homepage}"`,
    '',
    '[[artifacts]]',
    `os = "windows"`,
    `arch = "x64"`,
    `url = "${url}"`,
    `sha256 = "${sha}"`,
    `extract = "${extract}"`,
    ...(bins ? bins.split(',').map(pair => {
      const [from, to] = pair.trim().split('|');
      return `\n[[artifacts.bins]]\nfrom = "${from}"\nto = "${to}"`;
    }) : []),
    '',
  ].join('\n');

  const dir = path.join('packages', name);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${version}.toml`);
  fs.writeFileSync(file, toml);
  console.log(`\n✓ wrote ${file}`);
  console.log('\nNext steps:');
  console.log(`  1. Update index.json: add "${name}" → latest "${version}"`);
  console.log('  2. git checkout -b add-' + name);
  console.log('  3. git add . && git commit -m "add ' + name + ' ' + version + '"');
  console.log('  4. gh pr create');
  rl.close();
}

module.exports = { create };

if (require.main === module) create().catch(e => { console.error(e); process.exit(1); });
