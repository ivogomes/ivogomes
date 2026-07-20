#!/usr/bin/env bash
# Self-host the Outfit score font for the native build.
#
# The web app loads Outfit from Google Fonts, but the native shell strips that
# network call (copy-web.mjs) — so without local files the score readout falls
# back to system-ui. This downloads the exact Outfit woff2 files Google serves
# and writes an outfit.css that copy-web.mjs auto-detects and bundles.
#
# Run once (needs internet):  bash fonts/fetch-outfit.sh   (or: npm run fonts)
# Then:                       npm run sync
set -euo pipefail
cd "$(dirname "$0")"

# Weights the app actually uses (see --score-font / font-weight in index.html).
URL="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&display=swap"
# A modern desktop UA makes Google return woff2 (the smallest, best-supported format).
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

echo "• Fetching Outfit CSS from Google Fonts…"
curl -sfL -A "$UA" "$URL" -o raw.css

i=0
: > outfit.css
# Walk the CSS: each @font-face's `src: url(…woff2)` gets downloaded locally and
# the URL rewritten to the local filename. unicode-range/weight blocks are kept.
while IFS= read -r line; do
  if [[ "$line" =~ url\((https://[^\)]+\.woff2)\) ]]; then
    u="${BASH_REMATCH[1]}"
    f="outfit-$i.woff2"
    echo "  ↓ $f"
    curl -sfL "$u" -o "$f"
    line="${line//$u/$f}"
    i=$((i + 1))
  fi
  printf '%s\n' "$line" >> outfit.css
done < raw.css
rm -f raw.css

if [ "$i" -eq 0 ]; then
  echo "✗ No woff2 URLs found — Google may have returned a different format. Aborting." >&2
  rm -f outfit.css
  exit 1
fi
echo "✓ Wrote outfit.css + $i woff2 file(s) to $(pwd)"
echo "  Next: npm run sync   (copy-web.mjs will bundle ./fonts automatically)"
