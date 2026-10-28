const fs = require('fs');
const path = require('path');
const toml = require('smol-toml');
const { INDEX, ROOT, CONFIG } = require('./home');

const DEFAULT_REPO = 'https://raw.githubusercontent.com/<you>/bro-gang-repo/main';

function readConfig() {
  if (!fs.existsSync(CONFIG)) {
    const cfg = { repos: { main: DEFAULT_REPO } };
    fs.mkdirSync(path.dirname(CONFIG), { recursive: true });
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
    return cfg;
  }
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}

function readIndex() {
  if (!fs.existsSync(INDEX)) throw new Error('no index — run: bg repo update');
  return JSON.parse(fs.readFileSync(INDEX, 'utf8'));
}

function resolveVersion(name, version) {
  const idx = readIndex();
  const p = idx.packages[name];
  if (!p) throw new Error(`package not found: ${name}`);
  if (!version) return p.latest;
  if (!p.versions.includes(version)) {
    throw new Error(`${name}@${version} not found. Available: ${p.versions.join(', ')}`);
  }
  return version;
}

async function loadManifest(name, version) {
  const v = resolveVersion(name, version);
  const cfg = readConfig();
  const repo = cfg.repos.main;
  const url = `${repo}/packages/${name}/${v}.toml`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`manifest fetch failed: ${url} (${res.status})`);
  const text = await res.text();
  const m = toml.parse(text);

  // basic validation
  if (m.name !== name) throw new Error(`manifest name mismatch: ${m.name} != ${name}`);
  if (m.version !== v) throw new Error(`manifest version mismatch: ${m.version} != ${v}`);
  if (!Array.isArray(m.artifacts) || !m.artifacts.length) {
    throw new Error(`manifest has no artifacts`);
  }
  return m;
}

async function info([name]) {
  if (!name) throw new Error('usage: bg info <pkg>');
  const m = await loadManifest(name);
  console.log(JSON.stringify(m, null, 2));
}

module.exports = { loadManifest, readConfig, readIndex, info, DEFAULT_REPO };
