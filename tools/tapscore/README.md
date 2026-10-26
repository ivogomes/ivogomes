# TapScore (web app)

A tap-to-score tracker for racket and net sports. Tap your side to add a point; the app handles games, sets, tie-breaks, serve and the match result. It's an installable, offline-capable PWA, served at `/tools/tapscore/`, and it is also the web app that the native iOS and Android apps wrap.

**Sports:** tennis, padel, table tennis, pickleball (rally and side-out), squash, badminton, volleyball and beach volleyball.
**Languages:** English, Spanish, Portuguese, French and German.

| File | What it is |
| --- | --- |
| `index.html` | The whole app: markup, styles, translations and UI logic in one file. Loads `scoring.js`. |
| `scoring.js` | The scoring engine. No DOM, no I/O, no i18n. Exposes `window.TapScore`. |
| `scoring.test.cjs` | The engine's behaviour spec (15 test groups). Also the reference for the Swift and Kotlin ports. |
| `sw.js` | Service worker that precaches the app shell so it runs offline. |
| `manifest.webmanifest` | PWA manifest: fullscreen display, theme `#0b1220`, icons. |
| `privacy.html`, `privacy.css` | The privacy policy linked from the store listings. |
| `assets/` | Ball and trophy artwork. |
| `icon-*.png`, `favicon-*.png`, `apple-touch-icon.png`, `splash-*.png` | PWA icons and iOS splash screens. |

## Run it

The site is static, so serve the repo root and open the tool:

```bash
npm run preview        # from the repo root, serves at http://localhost:4000
# then open http://localhost:4000/tools/tapscore/
```

Open it over `http://localhost` or HTTPS. Service workers and install prompts don't work from `file://`.

## The scoring engine

`scoring.js` is the single source of truth for the rules. `scorePoint(state, side)` applies one rally win for side 0 or 1 and mutates the state in place. The app snapshots the state as JSON for undo (up to 200 steps).

Run the spec with Node (no dependencies):

```bash
node tools/tapscore/scoring.test.cjs
```

**Rule:** change scoring in `scoring.js` first and keep `scoring.test.cjs` green. Then mirror the change into the other two ports, so all three agree:

- Swift: `../tapscore-watch/Engine/` (run `swift test` there)
- Kotlin: `../tapscore-wear/engine/` (JUnit)

Don't reimplement rules inside `index.html`. It only wraps the engine and adds presentation, stats and timers.

## Features

- Tap-to-score with undo, serve tracking, set history and a match result screen.
- Match setup: sport, singles or doubles, best-of length, points target, advantage rules (unlimited, golden point, or N advantages), tie-break points and win-by.
- Match stats and a share card.
- Match history, kept on the device. Individual matches or the whole list can be deleted.
- Voice announcer, with a choice of voice and language.
- Bluetooth clicker support.
- Light, dark or system theme. Haptics and keep-awake where the device supports them.

## How it differs on the web and in the native apps

- **Web (this build):** free for everyone. There's no trial, paywall or Pro pill, because `PRO_ENABLED` is only true when running inside the native shell.
- **Native apps:** the same file, copied by `../tapscore-app/`. The first 3 completed games are free, then a one-time Pro unlock (`pro_unlock`) is needed to start new matches. Nothing is gated by sport or feature.
- Native-only code is feature-gated on `window.Capacitor`, so it is a no-op in the browser. The service worker is skipped inside the native app.

## Storage

Everything stays on the device in `localStorage`, under keys prefixed `tennisTracker.` (language, theme, history, voice settings, clicker settings, and the trial and Pro state in the native apps). Nothing is sent to a server.

The only network request the web app makes is for the Outfit score font from Google Fonts. It falls back to the system font if that fails. It has no analytics. The native build removes that request, and `../tapscore-app/` explains how to bundle Outfit instead. See `privacy.html` for what the policy says.

## Editing

- **After changing `index.html` or any shell file, bump `CACHE` in `sw.js`** (currently `tennis-tracker-v75`). Otherwise installed clients keep the old version. Add any new shell file to the `SHELL` list too.
- When you change a UI string, update all five languages in the translation blocks.
- After changing this folder, re-run `npm run sync` in `../tapscore-app/` to refresh the native apps.
- Style rules live in the repo's `STYLEGUIDE.md`.

## Related

- [`../tapscore-app/`](../tapscore-app/): the iOS and Android shell (Capacitor).
- [`../tapscore-watch/`](../tapscore-watch/): the Apple Watch scorer.
- [`../tapscore-wear/`](../tapscore-wear/): the Wear OS scorer.
