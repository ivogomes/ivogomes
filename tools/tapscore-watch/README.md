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

Xcode can't wrap this with Capacitor, so the watch app is a small native app you assemble once. You build
it as a **companion Watch App target inside your existing iPhone app** — that one watch app both **plays
standalone on the wrist** *and* adds the **"Control phone"** remote mode.

👉 **The full, beginner-friendly click-by-click is in [REMOTE.md](REMOTE.md)** — every button, plus the
gotchas (the empty companion dropdown, linking the engine package, the blank app icon). Follow that.

The gist of what REMOTE.md has you do:
1. Open `tools/tapscore-app/ios/App/App.xcworkspace` (the **workspace**, not the project).
2. **File ▸ New ▸ Target ▸ watchOS ▸ App** → "Watch App for Existing iOS App" → pick **App**.
3. Delete the two generated starter files; drag in our `WatchApp/*.swift` (tick the watch target).
4. Add the local **TapScoreEngine** package **and confirm it's linked** to the watch target.
5. Set **Minimum Deployments = watchOS 10.0**.
6. Add the `WatchLink` bridge to the iPhone app + set the storyboard's class to `MainViewController`.
7. Give the watch an app icon, then **Run the watch scheme** onto a paired watch.

> There's deliberately no separate "standalone-only" build: a watch app with no host iPhone app works on
> the wrist but can never control the phone, so it isn't worth shipping. (You *can* make a plain watchOS
> project just to poke at the UI, but for anything real use the companion setup above.)

### If the build complains
- **"'main' attribute can only apply to one type"** → you didn't delete *both* Xcode-generated starter
  files; our `TapScoreApp.swift` is the real `@main`.
- **"Cannot find 'ScoringEngine' / 'MatchState' in scope"** → the `TapScoreEngine` package is referenced
  but not **linked** to the watch target → watch target ▸ General ▸ *Frameworks, Libraries, and Embedded
  Content* ▸ **+** ▸ add `TapScoreEngine` (REMOTE.md step 1.7).
- **Files added but not compiling** → select each file ▸ File inspector (right panel) ▸ tick the watch
  target under **Target Membership**.
- **"'Observable' is only available in watchOS 10.0 or newer"** → set the watch target's **Minimum
  Deployments** to **watchOS 10.0**.
- **No app icon on the watch / can't find it** → run the **watch** scheme directly (not just the iPhone
  scheme), and add a 1024×1024 icon (REMOTE.md steps 3–4).

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
