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
    ├── MainActivity.kt         entry point (routes standalone / remote)
    ├── MatchModel.kt           standalone match: engine, haptics, undo, last format
    ├── Theme.kt                palette + per-event Haptics (Vibrator)
    ├── Screens.kt              ScoringScreen (two zones) · StartScreen · EndScreen
    ├── RemoteModel.kt          "Control phone" mode — MessageClient (see REMOTE.md)
    └── RemoteScreen.kt         remote mirror + tap-to-score
```

## The engine is validated
`ScoringEngine.kt` is a line-for-line port of the web engine and passes the full spec (all 25 checks
of `scoring.test.cjs`, mirrored in `ScoringEngineTest.kt`). **Rule:** change scoring in `scoring.js`
first, keep `scoring.test.cjs` green, then mirror into the Kotlin **and** Swift ports and keep both
test suites green. JS ⇄ Kotlin ⇄ Swift must never disagree.

## Build the Wear OS app in Android Studio

Capacitor can't target Wear OS, so this is a native app.

> **Recommended → build the companion-capable app.** Use the steps below, but set the module's
> **`applicationId` to the phone's (`com.ivogomes.tapscore`)** and sign with the **same key** — see
> **[REMOTE.md](REMOTE.md)**. That *same* app plays standalone on the watch **and** unlocks "Control phone".
>
> A pure-standalone build (keeping its own `…​.wear` applicationId) works on the wrist but can **never**
> control the phone. Fine for quick testing; for release use the companion-capable setup.

### Steps
Plan: make an empty Wear app → drop in the engine + our UI → set the applicationId → run.

1. **Android Studio → File → New → New Project.**
2. Choose the **Wear OS** category → **Empty Wear App** (Compose) → **Next**.
3. Fill in and finish:
   - **Name:** `TapScore Wear`
   - **Package name:** `com.ivogomes.tapscore.wear` *(matches our files — don't change it)*
   - **Language:** Kotlin → **Finish**, then let Gradle finish syncing.
4. **Add the engine.** In the Project panel (Android view) expand `app → kotlin+java →
   com.ivogomes.tapscore`. Right-click the package → **New → Package** → name it **engine**. Drag
   `engine/ScoringEngine.kt` into it (it declares `package com.ivogomes.tapscore.engine`).
5. **Add the UI.** Make another sub-package **wear** the same way, then drag in **all six** `WearApp/*.kt`
   files (`MainActivity.kt`, `MatchModel.kt`, `Theme.kt`, `Screens.kt`, `RemoteModel.kt`, `RemoteScreen.kt`).
   If Android Studio generated a starter `MainActivity`, delete it — ours is the real one. Confirm
   `AndroidManifest.xml` has `<activity android:name=".MainActivity" …>` (the default already does).
6. **Module `build.gradle`.** For the companion/remote build, set
   `android { defaultConfig { applicationId "com.ivogomes.tapscore" } }` (must equal the phone app; the
   Kotlin `package` stays `com.ivogomes.tapscore.wear`), and add the Data-Layer dependency:
   `implementation("com.google.android.gms:play-services-wearable:18.1.0")`. The Compose-for-Wear
   template covers everything else. *(For a throwaway standalone-only test you can skip both.)*
7. **(Optional) tests.** Put `engine/ScoringEngineTest.kt` under
   `app/src/test/java/com/ivogomes/tapscore/engine/`, ensure `testImplementation("junit:junit:4.13.2")`,
   then run `./gradlew test` (or right-click the class → Run).
8. **Run.** Create a **Wear OS emulator** (Tools → Device Manager → Add → Wear OS) or pair a watch, then
   **Run ▶**. You should land on the **Start** screen — pick a sport and tap **Start**.

> Standalone "Control phone" won't connect (no host phone app with the matching id). For that, follow
> [REMOTE.md](REMOTE.md).

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

## Remote mode (implemented)
The **"Control phone"** mode mirrors and controls the phone's live match over the Wearable Data Layer —
code is written; assemble/test on device per [REMOTE.md](REMOTE.md).

## Not yet wired (next steps)
- On-watch advanced format (points target, advantage rules, tie-break points) — v1 uses sensible
  defaults; full setup stays on the phone.
- Free-play "End match → winner/tie" entry point on the watch.
- A Tile / complication showing the live score.
```
