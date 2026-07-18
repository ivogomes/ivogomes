/*
 * copy-web.mjs — assemble the Capacitor webDir (./www) from the TapScore PWA.
 *
 * The native app bundles its assets locally, so we:
 *   1. copy the PWA files from ../tapscore into ./www
 *   2. drop things the native shell doesn't need (service worker, iOS web splash images)
 *   3. remove the Google Fonts <link>s so the app makes ZERO network calls
 *      (the CSS already falls back to system-ui; drop a self-hosted font in
 *       ./fonts to restore Outfit exactly — see README).
 *
 * Run: npm run copy:web   (or npm run sync to also run `cap sync`)
 */
import { cp, rm, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'tapscore');
const OUT = join(here, 'www');
const FONTS = join(here, 'fonts'); // optional self-hosted font (outfit.css + .woff2)

// Files/dirs we never copy into the native bundle.
const SKIP = new Set(['sw.js', '.DS_Store', '.claude']);
const SKIP_PREFIX = ['splash-']; // iOS apple-touch-startup-image PNGs — native uses its own splash

async function exists(p) { try { await access(p); return true; } catch { return false; } }

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await cp(SRC, OUT, {
  recursive: true,
  filter: (src) => {
    const name = src.slice(SRC.length + 1);
    if (!name) return true;
    const base = name.split('/').pop();
    if (SKIP.has(base)) return false;
    if (SKIP_PREFIX.some((p) => base.startsWith(p))) return false;
    return true;
  },
});

// ---- transform index.html -------------------------------------------------
const indexPath = join(OUT, 'index.html');
let html = await readFile(indexPath, 'utf8');

// Strip the Google Fonts preconnects + stylesheet (network calls).
html = html
  .replace(/^\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"[^>]*>\s*$/m, '')
  .replace(/^\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>\s*$/m, '')
  .replace(/^\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[^>]*>\s*$/m, '');

// If a self-hosted font is present, wire it up in place of Google Fonts.
if (await exists(join(FONTS, 'outfit.css'))) {
  await cp(FONTS, join(OUT, 'fonts'), { recursive: true });
  html = html.replace('</title>', '</title>\n<link rel="stylesheet" href="fonts/outfit.css" />');
  console.log('• self-hosted Outfit font bundled from ./fonts');
} else {
  console.log('• no ./fonts/outfit.css found — native build falls back to system-ui (see README to bundle Outfit)');
}

await writeFile(indexPath, html);
console.log(`✓ web assets copied to ${OUT}`);
