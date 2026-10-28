const os = require('os');
const path = require('path');
const fs = require('fs');

const ROOT = process.env.BROGANG_HOME || path.join(os.homedir(), '.broGang');

function ensureDirs() {
  for (const d of ['cache', 'apps', 'shims']) {
    fs.mkdirSync(path.join(ROOT, d), { recursive: true });
  }
}

module.exports = {
  ROOT,
  CACHE: path.join(ROOT, 'cache'),
  APPS: path.join(ROOT, 'apps'),
  SHIMS: path.join(ROOT, 'shims'),
  STATE: path.join(ROOT, 'state.json'),
  CONFIG: path.join(ROOT, 'config.json'),
  INDEX: path.join(ROOT, 'index.json'),
  ensureDirs,
};
