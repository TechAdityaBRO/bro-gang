const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return dest;
}

function sha256File(file) {
  const h = crypto.createHash('sha256');
  h.update(fs.readFileSync(file));
  return h.digest('hex');
}

async function fetchVerified(url, expectedSha, cacheDir) {
  const dest = path.join(cacheDir, expectedSha);
  if (fs.existsSync(dest) && sha256File(dest) === expectedSha) return dest;
  await download(url, dest);
  const actual = sha256File(dest);
  if (actual !== expectedSha) {
    fs.unlinkSync(dest);
    throw new Error(`SHA256 mismatch: expected ${expectedSha}, got ${actual}`);
  }
  return dest;
}

module.exports = { download, sha256File, fetchVerified };
