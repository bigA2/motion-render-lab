// Extractor v2 (no AI): install the PUBLISHED @activepieces/piece-* packages from npm and read the real
// runtime metadata (actions/triggers: name, displayName, description, aiMetadata.description).
// Pieces that fail to install or load are left out; build_graph.py falls back to regex for them.
// Run: node graph/extract.mjs <community-dir> <work-dir>  -> <work-dir>/npm_meta.json + npm_failed.txt
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [ROOT, WORK] = process.argv.slice(2);
const pkgs = {};  // npm name -> slug
for (const slug of fs.readdirSync(ROOT).sort()) {
  const p = path.join(ROOT, slug, 'package.json');
  if (fs.existsSync(p)) pkgs[JSON.parse(fs.readFileSync(p, 'utf8')).name] = slug;
}
const BASE = ['@activepieces/pieces-framework', '@activepieces/pieces-common', '@activepieces/shared'];
const step = (s) => ({ name: s.name, displayName: s.displayName || '', description: s.description || '',
  ai: s.aiMetadata?.description || '' });
const out = {}, failed = [];

function read(n) {  // load one installed package and read its piece object
  try {
    const mod = createRequire(path.join(WORK, 'package.json'))(n);
    const piece = Object.values(mod).find((v) => v && typeof v === 'object' && v.displayName && (v._actions || typeof v.actions === 'function'));
    if (!piece) throw new Error('no piece export');
    const acts = typeof piece.actions === 'function' ? piece.actions() : piece._actions;
    const trigs = typeof piece.triggers === 'function' ? piece.triggers() : piece._triggers;
    out[pkgs[n]] = { displayName: piece.displayName, description: piece.description || '', categories: piece.categories || [],
      actions: Object.values(acts || {}).map(step), triggers: Object.values(trigs || {}).map(step) };
  } catch (e) { failed.push(`load ${n}: ${String(e.message).split('\n')[0].slice(0, 120)}`); }
}

// each unit: fresh tree -> install -> read right away -> wipe (a later install would prune it anyway)
function unit(names) {
  fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK, { recursive: true });
  fs.writeFileSync(path.join(WORK, 'package.json'), '{"name":"x","private":true}');
  try {
    execSync(`npm install --ignore-scripts --legacy-peer-deps --no-audit --no-fund --omit=dev ${[...BASE, ...names].join(' ')}`,
      { cwd: WORK, stdio: 'pipe', timeout: 15 * 60e3 });
  } catch (e) {
    if (names.length === 1) {
      const err = String(e.stderr || e.message).trim().split('\n').filter((l) => /ERR/.test(l)).slice(-2).join(' | ');
      return failed.push(`install ${names[0]}: ${err.slice(0, 200)}`);
    }
    const h = names.length >> 1; unit(names.slice(0, h)); unit(names.slice(h)); return;  // split in half
  }
  names.forEach(read);
}

const first = ['@activepieces/piece-trello', '@activepieces/piece-github'].filter((n) => pkgs[n]);
unit(first);
for (const n of first) console.log(`${n}: ${out[pkgs[n]]?.triggers.length ?? 'FAILED'} triggers`);
if (first.some((n) => !out[pkgs[n]]?.triggers.length)) { console.log(failed.join('\n')); process.exit(1); }
const rest = Object.keys(pkgs).filter((n) => !first.includes(n));
for (let i = 0; i < rest.length; i += 40) {
  unit(rest.slice(i, i + 40));
  console.log(`done ${Math.min(i + 40, rest.length)}/${rest.length}, failed so far ${failed.length}`);
}
fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, 'npm_meta.json'), JSON.stringify(out));
fs.writeFileSync(path.join(WORK, 'npm_failed.txt'), failed.join('\n') + '\n');
console.log(`npm metadata: ${Object.keys(out).length}/${Object.keys(pkgs).length} pieces; failed ${failed.length}`);
process.exit(0);
