const fs = require('fs');
const path = require('path');
const { STATE } = require('./home');

function readState() {
  if (!fs.existsSync(STATE)) return { installed: {} };
  return JSON.parse(fs.readFileSync(STATE, 'utf8'));
}

function writeState(s) {
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}

module.exports = { readState, writeState };
