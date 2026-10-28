const { readState, writeState } = require('./state');
const { readIndex } = require('./manifest');
const { install } = require('./install');

async function upgrade([name]) {
  const s = readState();
  const idx = readIndex();
  const targets = name ? [name] : Object.keys(s.installed);

  for (const n of targets) {
    const cur = s.installed[n]?.version;
    const latest = idx.packages[n]?.latest;
    if (!latest) { console.log(`[bg] ${n}: not in repo, skipping`); continue; }
    if (cur === latest) { console.log(`[bg] ${n}: up to date (${cur})`); continue; }
    console.log(`[bg] upgrading ${n} ${cur} → ${latest}`);
    if (cur) {
      delete s.installed[n];
      writeState(s);
    }
    await install([`${n}@${latest}`]);
  }
}

module.exports = { upgrade };
