const fs = require('fs');
const path = require('path');
const { loadManifest } = require('./manifest');
const { fetchVerified } = require('./download');
const { runPs } = require('./ps');
const { readState, writeState } = require('./state');
const { CACHE, APPS, SHIMS, ensureDirs } = require('./home');

function pickArtifact(m) {
  return m.artifacts.find(a => a.os === 'windows' && a.arch === 'x64')
    || m.artifacts.find(a => a.os === 'windows');
}

async function install([spec]) {
  if (!spec) throw new Error('usage: bg install <pkg>[@version]');
  ensureDirs();
  const [name, version] = spec.split('@');

  console.log(`[bg] resolving ${name}${version ? '@' + version : ''}...`);
  const m = await loadManifest(name, version);
  const art = pickArtifact(m);
  if (!art) throw new Error(`no windows artifact for ${name}@${m.version}`);

  console.log(`[bg] downloading ${art.url}`);
  const file = await fetchVerified(art.url, art.sha256, CACHE);

  const dest = path.join(APPS, name, m.version);

  if (art.extract === 'zip') {
    const bins = (art.bins || []).map(b => `${b.from}|${b.to}`).join(',');
    await runPs('install-zip.ps1', [
      '-ZipPath', file, '-DestDir', dest, '-Bins', bins, '-ShimDir', SHIMS,
    ]);
  } else if (art.extract === 'msi') {
    await runPs('install-msi.ps1', ['-MsiPath', file]);
  } else {
    throw new Error(`unsupported extract: ${art.extract}`);
  }

  const s = readState();
  s.installed[name] = { version: m.version, dir: dest, sha256: art.sha256 };
  writeState(s);
  console.log(`[bg] ✓ ${name} ${m.version}`);
}

module.exports = { install };
