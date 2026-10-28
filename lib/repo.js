const fs = require('fs');
const path = require('path');
const { INDEX } = require('./home');
const { readConfig } = require('./manifest');

async function repoUpdate() {
  const cfg = readConfig();
  const merged = { schema: 1, packages: {} };
  for (const [name, base] of Object.entries(cfg.repos)) {
    process.stdout.write(`[bg] fetching ${name}... `);
    const res = await fetch(`${base}/index.json`);
    if (!res.ok) { console.log(`FAIL ${res.status}`); continue; }
    const idx = await res.json();
    Object.assign(merged.packages, idx.packages);
    console.log('ok');
  }
  fs.writeFileSync(INDEX, JSON.stringify(merged, null, 2));
}

async function repoAdd([name, url]) {
  if (!name || !url) throw new Error('usage: bg repo add <name> <url>');
  const cfg = readConfig();
  cfg.repos[name] = url.replace(/\/$/, '');
  fs.writeFileSync(path.join(path.dirname(INDEX), 'config.json'), JSON.stringify(cfg, null, 2));
  console.log(`[bg] repo '${name}' → ${url}`);
}

async function search([q]) {
  if (!q) throw new Error('usage: bg search <query>');
  const idx = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  const hits = Object.entries(idx.packages)
    .filter(([n, p]) => n.includes(q) || (p.description || '').toLowerCase().includes(q.toLowerCase()));
  if (!hits.length) { console.log('no matches'); return; }
  for (const [n, p] of hits) {
    console.log(`${n.padEnd(24)} ${p.latest.padEnd(12)} ${p.description || ''}`);
  }
}

module.exports = { repoUpdate, repoAdd, search };
