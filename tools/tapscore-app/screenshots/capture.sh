#!/usr/bin/env bash
# Capture Play-ready phone screenshots from a connected Android device/emulator.
#
# Google Play requires phone screenshots with an aspect ratio between 16:9 and 9:16, each side
# 320–3840px. Modern phones are TALLER than 9:16, so raw screenshots get rejected. This fits each
# shot onto a 1080×1920 (9:16) canvas padded with the app background — always valid, nothing cropped.
#
# Usage: navigate the app to a screen, then run (repeat per screen; Play allows up to 8):
#   npm run shots -- start
#   npm run shots -- match
#   npm run shots -- stats
#   npm run shots -- paywall
#
# Tip (cleaner marketing shots — hides the real clock/battery with a demo status bar):
#   adb shell settings put global sysui_demo_allowed 1
#   adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0900
#   adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
#   …capture…   then: adb shell am broadcast -a com.android.systemui.demo -e command exit
set -euo pipefail
cd "$(dirname "$0")"

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
[ -x "$ADB" ] || ADB="adb"
command -v "$ADB" >/dev/null 2>&1 || { echo "adb not found — set ADB=/path/to/adb" >&2; exit 1; }
"$ADB" get-state >/dev/null 2>&1 || { echo "No device/emulator connected. Start one, then retry." >&2; exit 1; }

name="${1:-shot}"
raw="$(mktemp -t tapscore-shot).png"
"$ADB" exec-out screencap -p > "$raw"

out="play-${name}.png"
BG="#0b1220"
if command -v magick >/dev/null 2>&1; then
  magick "$raw" -resize 1080x1920 -background "$BG" -gravity center -extent 1080x1920 "$out"
elif command -v convert >/dev/null 2>&1; then
  convert "$raw" -resize 1080x1920 -background "$BG" -gravity center -extent 1080x1920 "$out"
else
  cp "$raw" "$out"
  echo "⚠ ImageMagick not found — saved the raw screenshot as-is." >&2
  echo "  Resize it to within 9:16–16:9 (≤3840px/side) before uploading to Play." >&2
fi
rm -f "$raw"
echo "✓ $(pwd)/$out  (1080×1920, Play-ready)"
