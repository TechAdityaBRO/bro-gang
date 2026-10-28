const fs = require('fs');
const path = require('path');
const { readState, writeState } = require('./state');
const { runPs } = require('./ps');
const { SHIMS } = require('./home');

async function uninstall([name]) {
  if (!name) throw new Error('usage: bg uninstall <pkg>');
  const s = readState();
  const rec = s.installed[name];
  if (!rec) throw new Error(`${name} is not installed`);

  await runPs('uninstall.ps1', [
    '-DestDir', rec.dir, '-ShimDir', SHIMS, '-PkgName', name,
  ]);

  delete s.installed[name];
  writeState(s);
  console.log(`[bg] ✓ ${name} removed`);
}

module.exports = { uninstall };
