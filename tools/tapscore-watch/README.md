# TapScore Watch (Apple Watch)

Standalone-first watchOS scorer: two tap zones (top = you, bottom = opponent), Digital Crown =
undo, long-press = menu. It reuses the shared scoring rules via a Swift port of the web engine.

```
tools/tapscore-watch/
├── Engine/                      Swift Package — pure scoring engine (no watchOS deps)
│   ├── Package.swift
│   ├── Sources/TapScoreEngine/ScoringEngine.swift   ← faithful port of ../tapscore/scoring.js
│   └── Tests/TapScoreEngineTests/ScoringEngineTests.swift  ← mirrors ../tapscore/scoring.test.cjs
└── WatchApp/                    SwiftUI sources to add to the watch target
    ├── TapScoreApp.swift        @main, RootView, Theme, Haptics
    ├── MatchModel.swift         standalone match: engine, haptics, undo, last format
    ├── Views.swift              ScoringView (two zones) · StartView · EndView
    ├── RemoteModel.swift        "Control phone" mode — WCSession session (see REMOTE.md)
    └── RemoteView.swift         remote mirror + tap-to-score
```

## 1. Verify the engine (no Xcode needed)

```bash
cd tools/tapscore-watch/Engine
swift test
```
The tests mirror the web spec — if they pass, the Swift port matches `scoring.js`. **Rule:** change
scoring rules in `scoring.js` first, keep `scoring.test.cjs` green, then mirror here and keep
`swift test` green. The two must never disagree.

## 2. Build the watch app in Xcode

Capacitor can't target watchOS, so this is a native app. **Build it as a companion Watch App target
inside your existing iOS app — the full click-by-click is in [REMOTE.md](REMOTE.md).**

That one watch app is everything you need: it **plays standalone on the wrist** *and* adds the
**"Control phone"** remote mode. (There's deliberately no separate "standalone-only" build — a watch-only
app with no host iOS app would work on the wrist but could never control the phone, so it isn't worth
shipping. To just experiment with the watch UI in isolation you *can* make a plain watchOS project, but
for anything real use the companion setup.)

In short, REMOTE.md walks you through: add a watchOS **App** target to `tools/tapscore-app/ios` ▸ delete
the generated starter files ▸ drag in `WatchApp/*.swift` and add the local **TapScoreEngine** package ▸
set **Minimum Deployments = watchOS 10.0** ▸ register the `WatchLink` plugin ▸ run.

### If the build complains
- **"'main' attribute can only apply to one type"** → you didn't delete *both* Xcode-generated starter
  files; our `TapScoreApp.swift` is the real `@main`.
- **"Cannot find 'ScoringEngine' / 'MatchState' in scope"** → the local `Engine` package isn't attached
  to the watch target (File ▸ Add Package Dependencies ▸ Add Local).
- **Files added but not compiling** → select each ▸ File inspector ▸ tick the watch target under
  **Target Membership**.
- **"'Observable' is only available in watchOS 10.0 or newer"** → set the watch target's **Minimum
  Deployments** to **watchOS 10.0**.
- **"'main' attribute can only apply to one type"** → you didn't delete *both* starter files (step 4).
- **"Cannot find 'ScoringEngine' / 'MatchState' in scope"** → the engine package isn't attached to the
  target (step 6).
- **Files added but not compiling** → select each → File inspector (right panel) → tick your watch target
  under **Target Membership**.
- **"'Observable' is only available in watchOS 10.0 or newer"** → do step 7.

## Score font (Outfit)

The scoreboard uses the same lime / dark-blue inversion as the phone (side A = lime bg + dark-blue
score, side B = dark-blue bg + lime score) and the **Outfit** score font. `Theme.score(_:)` calls
`Font.custom("Outfit", …)`, which falls back to the system font until Outfit is bundled:

1. Get the Outfit `.ttf` files (Bold + ExtraBold) from Google Fonts (or download directly).
2. Drag them into the **watch target** (tick it under *Add to targets*).
3. Add each filename under **Info.plist → "Fonts provided by application" (UIAppFonts)**.
4. Verify the family name is `Outfit` (Font Book), then rebuild.

## 3. What works in v1

- Standalone: opens to **Start** (last-used sport + best-of remembered), one tap to play.
- Two-zone scoring, serve dot, sets/tie pill, per-event **haptics** (point/game/set/match/undo).
- **Undo** via Digital Crown (downward) and the long-press menu.
- **End screen** on match completion (winner or tie) → New match / Home.

## Remote mode (implemented)
The **"Control phone"** mode mirrors and controls the phone's live match over WatchConnectivity — code
is written; assemble/test on device per [REMOTE.md](REMOTE.md). (A full two-way match handoff could
build on the same link later.)

## Not yet wired (next steps)

- On-watch advanced format (points target, advantage rules, tie-break points) — v1 uses sensible
  defaults; full setup stays on the phone.
- Free-play "End match → set winner/tie" on the watch (the web app has it; the engine supports the
  result logic — just needs a watch entry point).
- A complication showing the live score.

## Note on the toolchain
`swift test` works here; if you hit sandbox/CI weirdness, the engine also compiles standalone:
`swiftc Sources/TapScoreEngine/ScoringEngine.swift <your_main>.swift`.
