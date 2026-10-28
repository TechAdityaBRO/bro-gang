const { spawn } = require('child_process');
const path = require('path');

function runPs(script, args = []) {
  // In packaged exe, ps/ ships alongside the binary.
  const base = process.pkg
    ? path.dirname(process.execPath)
    : path.join(__dirname, '..');
  const scriptPath = path.join(base, 'ps', script);
  return new Promise((resolve, reject) => {
    const p = spawn('powershell.exe', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath, ...args,
    ], { stdio: 'inherit' });
    p.on('exit', code => code === 0 ? resolve() : reject(new Error(`PS ${script} exited ${code}`)));
    p.on('error', reject);
  });
}

module.exports = { runPs };
