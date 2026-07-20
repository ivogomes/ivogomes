# TapScore Wear (Wear OS)

Standalone-first Wear OS scorer: two tap zones (top = you, bottom = opponent), rotating bezel /
Digital Crown = undo, long-press = menu. It reuses the shared scoring rules via a Kotlin port of the
web engine. This is the Android counterpart to `tools/tapscore-watch/` (Apple Watch).

```
tools/tapscore-wear/
├── engine/                     Pure Kotlin scoring engine (no Android deps)
│   ├── ScoringEngine.kt        ← faithful port of ../tapscore/scoring.js
│   └── ScoringEngineTest.kt    ← JUnit spec mirroring ../tapscore/scoring.test.cjs
└── WearApp/                    Compose for Wear OS sources to add to a Wear OS app module
    ├── MainActivity.kt         entry point (setContent → RootScreen)
    ├── MatchModel.kt           drives the engine, haptics, undo stack, remembers last format
    ├── Theme.kt                palette + per-event Haptics (Vibrator)
    └── Screens.kt              ScoringScreen (two zones) · StartScreen · EndScreen
```

## The engine is validated
`ScoringEngine.kt` is a line-for-line port of the web engine and passes the full spec (all 25 checks
of `scoring.test.cjs`, mirrored in `ScoringEngineTest.kt`). **Rule:** change scoring in `scoring.js`
first, keep `scoring.test.cjs` green, then mirror into the Kotlin **and** Swift ports and keep both
test suites green. JS ⇄ Kotlin ⇄ Swift must never disagree.

## Create the Wear OS app in Android Studio

Capacitor can't target Wear OS, so this is a native app. Click-by-click:

1. **New project.** Android Studio ▸ **File ▸ New ▸ New Project…** ▸ template category **Wear OS** ▸
   **Empty Wear App** (Compose) ▸ Next.
   - Name: `TapScore Wear` · Package name: `com.ivogomes.tapscore.wear` · Language: **Kotlin** ▸ Finish.
   - This matches the `package` declarations in the source files (no editing needed).

2. **Add the engine.** In the Project view, open the app module's `java/com.ivogomes.tapscore` folder
   and create a sub-package **`engine`**, then drop in `engine/ScoringEngine.kt` (its package is
   `com.ivogomes.tapscore.engine`). *(Or keep the engine as its own library module — see below.)*

3. **Add the UI.** Copy the four `WearApp/*.kt` files into the app module's
   `java/com.ivogomes.tapscore/wear/` package (they declare `package com.ivogomes.tapscore.wear`).
   Delete the generated `MainActivity.kt`/`ContentView`-style starter if it clashes — ours is the real
   `MainActivity`. Make sure `AndroidManifest.xml`'s `<activity android:name=".MainActivity">` points
   at it (the default generated manifest already uses `.MainActivity`).

4. **Tests (optional but recommended).** Put `engine/ScoringEngineTest.kt` under `src/test/java/…/engine/`
   and ensure `testImplementation("junit:junit:4.13.2")` is in the module's `build.gradle`. Run with
   **`./gradlew test`** (or right-click the test class ▸ Run). It mirrors the web spec.

5. **Dependencies.** The Compose-for-Wear template already includes what the UI needs
   (`androidx.compose.foundation`, `androidx.wear.compose`). The UI is built on foundation primitives
   (`Box`/`Column`/`BasicText`/`combinedClickable`/`onRotaryScrollEvent`), so no extra libraries.

6. **Run.** Pick a **Wear OS emulator** (Tools ▸ Device Manager ▸ create e.g. "Wear OS Large Round")
   or a paired watch ▸ **Run ▶**. Installing to a physical watch works over the same adb/Wi‑Fi flow as
   the phone APK.

### Engine as a separate module (cleaner, optional)
Instead of step 2, create a plain Kotlin/Android library module `:engine`, drop `ScoringEngine.kt`
(and the test) there, and add `implementation(project(":engine"))` to the Wear app module. This keeps
the pure engine free of Android deps and lets it be shared with a future phone app.

## Score font (Outfit)

The scoreboard uses the same lime / dark-blue inversion as the phone (side A = lime bg + dark-blue
score, side B = dark-blue bg + lime score) and the **Outfit** score font. `Theme.scoreFont` defaults
to the system font until Outfit is bundled:

1. Download Outfit `.ttf` (Bold + ExtraBold); name them `outfit_bold.ttf` / `outfit_extrabold.ttf`
   (lowercase, underscores) and drop them in `app/src/main/res/font/`.
2. In `Theme.kt`, replace `val scoreFont = FontFamily.Default` with the commented `FontFamily(Font(…))`
   block below it, and add imports `androidx.compose.ui.text.font.Font`,
   `androidx.compose.ui.text.font.FontWeight`, and your app's `R`.
3. Rebuild.

## What works in v1
- Standalone: opens to **Start** (last sport + best-of remembered), one tap to play.
- Two-zone scoring, serve dot, scoreline/tie pill on the split, per-event **haptics**
  (point / game / set / match / undo).
- **Undo** via the rotating bezel / Digital Crown and the long-press menu.
- **End screen** on completion (winner or tie) → New match / Home.

## Not yet wired (next steps)
- **Phone ↔ watch sync** (Wearable Data Layer / MessageClient): mirror + handoff to the phone board.
  `MatchState`/`Settings` mirror the web JSON field names to make this straightforward.
- On-watch advanced format (points target, advantage rules, tie-break points) — v1 uses sensible
  defaults; full setup stays on the phone.
- Free-play "End match → winner/tie" entry point on the watch.
- A Tile / complication showing the live score.
```
