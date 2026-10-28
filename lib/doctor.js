const fs = require('fs');
const { readState } = require('./state');

async function doctor() {
  const s = readState();
  let bad = 0;
  for (const [name, rec] of Object.entries(s.installed)) {
    if (!fs.existsSync(rec.dir)) {
      console.log(`✗ ${name}: dir missing (${rec.dir})`);
      bad++;
    } else {
      console.log(`✓ ${name} ${rec.version}`);
    }
  }
  if (bad) { console.log(`\n${bad} broken install(s). Re-run: bg install <pkg>`); process.exit(1); }
  console.log('\nall good');
}

module.exports = { doctor };
