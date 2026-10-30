// Extractor v2 (no AI): install the PUBLISHED @activepieces/piece-* packages from npm and read the real
// runtime metadata (actions/triggers: name, displayName, description, aiMetadata.description).
// Pieces that fail to install or load are left out; build_graph.py falls back to regex for them.
// Run: node graph/extract.mjs <community-dir> <work-dir>  -> <work-dir>/npm_meta.json
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [ROOT, WORK] = process.argv.slice(2);
fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, 'package.json'), '{"name":"x","private":true}');
const pkgs = {};  // npm name -> slug
for (const slug of fs.readdirSync(ROOT).sort()) {
  const p = path.join(ROOT, slug, 'package.json');
  if (fs.existsSync(p)) pkgs[JSON.parse(fs.readFileSync(p, 'utf8')).name] = slug;
}
const npmi = (names) => execSync(`npm install --no-save --ignore-scripts --legacy-peer-deps --no-audit --no-fund --omit=dev ${names.join(' ')}`,
  { cwd: WORK, stdio: 'ignore', timeout: 15 * 60e3 });
const names = Object.keys(pkgs), failedInstall = [];
for (let i = 0; i < names.length; i += 40) {
  const batch = names.slice(i, i + 40);
  try { npmi(batch); } catch { for (const n of batch) { try { npmi([n]); } catch { failedInstall.push(n); } } }
  console.log(`installed ${Math.min(i + 40, names.length)}/${names.length}`);
}

const req = createRequire(path.join(WORK, 'package.json'));
const step = (s) => ({ name: s.name, displayName: s.displayName || '', description: s.description || '',
  ai: s.aiMetadata?.description || '' });
const out = {}, failedLoad = [];
for (const [n, slug] of Object.entries(pkgs)) {
  if (failedInstall.includes(n)) continue;
  try {
    const mod = req(n);
    const piece = Object.values(mod).find((v) => v && typeof v === 'object' && v.displayName && (v._actions || typeof v.actions === 'function'));
    if (!piece) throw new Error('no piece export');
    const acts = typeof piece.actions === 'function' ? piece.actions() : piece._actions;
    const trigs = typeof piece.triggers === 'function' ? piece.triggers() : piece._triggers;
    out[slug] = { displayName: piece.displayName, description: piece.description || '', categories: piece.categories || [],
      actions: Object.values(acts || {}).map(step), triggers: Object.values(trigs || {}).map(step) };
  } catch (e) { failedLoad.push(`${n}: ${String(e.message).slice(0, 80)}`); }
}
fs.writeFileSync(path.join(WORK, 'npm_meta.json'), JSON.stringify(out));
fs.writeFileSync(path.join(WORK, 'npm_failed.txt'), ['# install failed', ...failedInstall, '# load failed', ...failedLoad].join('\n') + '\n');
console.log(`npm metadata: ${Object.keys(out).length}/${names.length} pieces; install failed ${failedInstall.length}, load failed ${failedLoad.length}`);
process.exit(0);
