#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { install } = require('./lib/install');
const { uninstall } = require('./lib/uninstall');
const { list } = require('./lib/list');
const { upgrade } = require('./lib/upgrade');
const { search, repoAdd, repoUpdate } = require('./lib/repo');
const { info } = require('./lib/manifest');
const { doctor } = require('./lib/doctor');
const { create } = require('./lib/create');

const aliases = { i: 'install', rm: 'uninstall', ls: 'list', up: 'upgrade' };
const commands = {
  install, uninstall, list, upgrade, search, info, doctor, create,
  'repo add': repoAdd, 'repo update': repoUpdate,
};

const argv = process.argv.slice(2);
if (!argv.length || argv[0] === '--help' || argv[0] === '-h') {
  console.log(fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8'));
  process.exit(0);
}
if (argv[0] === '--version' || argv[0] === '-v') {
  console.log('bg ' + require('./package.json').version);
  process.exit(0);
}

let cmd = aliases[argv[0]] || argv[0];
let rest = argv.slice(1);
if (cmd === 'repo') { cmd = 'repo ' + rest[0]; rest = rest.slice(1); }

const fn = commands[cmd];
if (!fn) { console.error(`bg: unknown command '${cmd}'`); process.exit(1); }
fn(rest).catch(e => { console.error(`bg: ${e.message}`); process.exit(1); });
