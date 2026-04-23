import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const dev = process.argv.includes('--watch');
mkdirSync('dist', { recursive: true });

// CSS — concatenate tokens + main, then minify
const css = readFileSync('src/tokens.css', 'utf8') + '\n' + readFileSync('src/main.css', 'utf8');
const { code: cssOut } = await esbuild.transform(css, { loader: 'css', minify: true });
writeFileSync('dist/style.min.css', cssOut);

// JS — bundle + (minify in prod)
const ctx = await esbuild.context({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  outfile: 'dist/bundle.min.js',
  platform: 'browser',
  target: ['es2018'],
});

if (dev) {
  await ctx.watch();
  console.log('Watching src/ — Ctrl+C to stop');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('✓ dist/bundle.min.js  dist/style.min.css');
}
