# TapScore Watch (Apple Watch)

Standalone-first watchOS scorer: two tap zones (top = you, bottom = opponent), Digital Crown =
undo, long-press = menu. It reuses the shared scoring rules via a Swift port of the web engine.

```
tools/tapscore-watch/
├── Engine/                      Swift Package — pure scoring engine (no watchOS deps)
│   ├── Package.swift
│   ├── Sources/TapScoreEngine/ScoringEngine.swift   ← faithful port of ../tapscore/scoring.js
│   └── Tests/TapScoreEngineTests/ScoringEngineTests.swift  ← mirrors ../tapscore/scoring.test.cjs
└── WatchApp/                    SwiftUI sources to add to a watchOS App target
    ├── TapScoreApp.swift        @main, RootView, Theme, Haptics
    ├── MatchModel.swift         drives the engine, haptics, undo stack, remembers last format
    └── Views.swift              ScoringView (two zones) · StartView · EndView
```

## 1. Verify the engine (no Xcode needed)

```bash
cd tools/tapscore-watch/Engine
swift test
```
The tests mirror the web spec — if they pass, the Swift port matches `scoring.js`. **Rule:** change
scoring rules in `scoring.js` first, keep `scoring.test.cjs` green, then mirror here and keep
`swift test` green. The two must never disagree.

## 2. Create the watchOS app in Xcode

Capacitor can't target watchOS, so this is a native app. Easiest is a **standalone project** (you can
integrate it as a phone companion later). Click-by-click:

1. **Create the project.** Xcode ▸ **File ▸ New ▸ Project…** ▸ top tabs pick **watchOS** ▸ **App** ▸ Next.
   - Product Name: `TapScore Watch` · Interface: **SwiftUI** · Language: **Swift** · (untick tests) ▸ Next.
   - Save it inside `tools/tapscore-watch/` (or anywhere). Xcode now generates a starter app with two
     Swift files, e.g. `TapScore_WatchApp.swift` and `ContentView.swift`.

2. **Delete the two generated Swift files.** In the left **Project navigator**, select
   `TapScore_WatchApp.swift` **and** `ContentView.swift` ▸ right-click ▸ **Delete** ▸ **Move to Trash**.
   *(Why: our `WatchApp/TapScoreApp.swift` is the real `@main` entry — keeping Xcode's generated one too
   causes a "duplicate `@main`"/redeclaration build error.)*

3. **Add our source files.** In Finder open `tools/tapscore-watch/WatchApp/`, select all three —
   `TapScoreApp.swift`, `MatchModel.swift`, `Views.swift` — and **drag them into the Project navigator**
   (drop them under the app's yellow group). In the sheet that appears: tick **Copy items if needed**
   and make sure your **TapScore Watch** target is checked under *Add to targets* ▸ Finish.

4. **Add the scoring engine package.** **File ▸ Add Package Dependencies…** ▸ click **Add Local…**
   (bottom-left) ▸ select the folder `tools/tapscore-watch/Engine` ▸ **Add Package** ▸ on the next sheet
   add the **TapScoreEngine** library to the **TapScore Watch** target ▸ Add.
   - Verify: click the blue project icon ▸ your watch target ▸ **General** ▸ **Frameworks, Libraries,
     and Embedded Content** should list `TapScoreEngine`. (If it doesn't, click **+** and add it.)

5. **Signing.** Same target ▸ **Signing & Capabilities** ▸ tick *Automatically manage signing* ▸ pick
   your **Team** (add your Apple ID first via Xcode ▸ Settings ▸ Accounts if the Team list is empty).

6. **Run.** In the top toolbar pick a **Watch simulator** (e.g. "Apple Watch Series 10") or your paired
   watch ▸ press **▶**. First run on a device: on the watch, trust the developer profile if prompted.

### If a build error pops up
- **"'main' attribute can only apply to one type" / duplicate `@main`** → step 2 wasn't done; delete the
  generated `*App.swift`.
- **"Cannot find 'MatchState' / 'ScoringEngine' in scope"** → the package isn't linked to the target
  (step 4), or a file is missing `import TapScoreEngine` (all three of ours already have it where needed).
- **Files show but don't compile** → they weren't added to the target's *Membership* (select a file ▸
  File inspector ▸ tick the watch target under *Target Membership*).
- **"'Observable' is only available in watchOS 10.0 or newer"** → set the watch target's
  **Minimum Deployments** to **watchOS 10.0+** (project ▸ target ▸ General ▸ Minimum Deployments).
  The model uses the modern `@Observable` macro (no Combine), which needs watchOS 10+.

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

## Not yet wired (next steps)

- **Phone ↔ watch sync** (WatchConnectivity): mirror + handoff so the phone shows the big board.
  `MatchState`/`Settings` are `Codable` with the same field names as the web JSON to make this easy.
- On-watch advanced format (points target, advantage rules, tie-break points) — v1 uses sensible
  defaults; full setup stays on the phone.
- Free-play "End match → set winner/tie" on the watch (the web app has it; the engine supports the
  result logic — just needs a watch entry point).
- A complication showing the live score.

## Note on the toolchain
`swift test` works here; if you hit sandbox/CI weirdness, the engine also compiles standalone:
`swiftc Sources/TapScoreEngine/ScoringEngine.swift <your_main>.swift`.
