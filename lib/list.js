const { readState } = require('./state');

async function list() {
  const s = readState();
  const names = Object.keys(s.installed).sort();
  if (!names.length) { console.log('nothing installed'); return; }
  console.log('NAME'.padEnd(24) + 'VERSION');
  for (const n of names) console.log(n.padEnd(24) + s.installed[n].version);
}

module.exports = { list };
