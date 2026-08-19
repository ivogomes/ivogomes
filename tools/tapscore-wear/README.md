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

Never built an Android app before? That's fine — this walks you through **every** click. Capacitor can't
target Wear OS, so this watch app is a normal (native) Android project that you assemble once and then
just press ▶ to run.

**What you'll do, in plain English:** install Android Studio → let it create a blank watch app → copy our
code files into it → change one line so it can talk to the phone → run it on a pretend watch (emulator).
Budget ~30–45 min the first time (most of it is downloads).

> **Which flavour to build?** Build the **companion** version (the default in these steps: `applicationId`
> = `com.ivogomes.tapscore`, signed with the phone's key). That one app both **works on its own on the
> wrist** *and* can **control a match running on the phone**. A "standalone-only" build (its own
> `…​.wear` id) runs on the wrist but can **never** talk to the phone — only pick that if you're just
> poking at the UI. Full companion details: **[REMOTE.md](../tapscore-watch/REMOTE.md)**.

### 0. Install the tools (one time)
1. Download and install **Android Studio** from <https://developer.android.com/studio> (free). Open it and
   let it run its first-launch **Setup Wizard** — click through with the defaults. It downloads the Android
   SDK; this takes a while. Let it finish.

### 1. Create a blank Wear OS app
1. On the Android Studio welcome screen, click **New Project** (or menu **File → New → New Project…**).
2. In the template list, find and click the **Wear OS** tab/category on the left, choose **Empty Wear App**
   (it uses "Compose", which is what we want), then click **Next**.
3. On the next screen fill these in **exactly**:
   - **Name:** `TapScore Wear`
   - **Package name:** `com.ivogomes.tapscore.wear`  ← must match our code, don't change a single letter
   - **Language:** `Kotlin`
   - Leave **Minimum SDK** at whatever it suggests.
4. Click **Finish**. Android Studio opens the project and starts **Gradle sync** (it's downloading/wiring
   dependencies). Watch the bottom status bar — **wait until it says it's done** (no spinner). Errors here
   are almost always "still downloading" — give it time.

### 2. Show your files in a way that's easy to work with
At the **top-left** of the Project panel there's a dropdown that usually says **Android**. Leave it on
**Android** — it groups things the friendly way. You'll mostly work inside
`app → kotlin+java → com.ivogomes.tapscore`.

You'll copy files from this repo folder into the project. On your Mac, open a Finder window at
`tools/tapscore-wear/` so you can drag files across.

### 3. Add the scoring engine (the rules)
This is the shared code that turns taps into tennis/padel scores.
1. In the Project panel, expand `app → kotlin+java`. **Right-click** the package
   **`com.ivogomes.tapscore`** → **New → Package**. Type **`engine`** and press Enter. (You now have
   `com.ivogomes.tapscore.engine`.)
2. From Finder, **drag** `engine/ScoringEngine.kt` onto that new **engine** package in Android Studio. When
   it asks, choose **Copy** and confirm the target folder is the `engine` package. (The file already starts
   with `package com.ivogomes.tapscore.engine`, so it lands correctly.)

### 4. Add our watch app (the screens)
1. Right-click **`com.ivogomes.tapscore`** again → **New → Package** → name it **`wear`**.
2. From Finder, open `WearApp/` and drag in **all six** `.kt` files onto the **wear** package:
   `MainActivity.kt`, `MatchModel.kt`, `Theme.kt`, `Screens.kt`, `RemoteModel.kt`, `RemoteScreen.kt`
   (Copy when asked).
3. The template created its own starter `MainActivity` (often at `com.ivogomes.tapscore.presentation` or
   directly under `com.ivogomes.tapscore`). **Delete that generated one** — ours (in the `wear` package) is
   the real entry point. If Android Studio complains later about "duplicate MainActivity", you missed this.
4. Open `app/src/main/AndroidManifest.xml` and check the `<activity …>` line points at our activity. It
   should read `android:name=".wear.MainActivity"` (since ours lives in the `wear` sub-package). If the
   template wrote a different path, fix it to `.wear.MainActivity`.

### 5. Add Material 3 Expressive
The screens (`Screens.kt`, `RemoteScreen.kt`, `Theme.kt`) are written against
**Wear Compose Material 3** — this is required, the app won't compile without it. Open
**`app/build.gradle`** (Module :app) and, inside `dependencies { … }`, add:
```
implementation("androidx.wear.compose:compose-material3:1.6.2")
```
Android Studio's Empty Wear App (Compose) template already brings compatible Compose/Kotlin
versions, so this shouldn't need any other version wrangling. If Gradle sync complains about a
version clash, bump to whatever stable version the sync error/IDE suggests instead of 1.6.2.

One visible, intentional change that comes with this: the standard Wear clock (`TimeText`) now
shows on every chrome screen (Home, local match setup, End, "Control phone" status/menus) — just
not during actual scoring, which stays clock-free full-bleed like before.

### 6. Make it able to talk to the phone (one line + one dependency)
Open the **module** `build.gradle` — the one at **`app/build.gradle`** (also shown as
**"build.gradle (Module :app)"**), *not* the project-level one. Then:
1. Inside `android { defaultConfig { … } }`, set the app id to the **phone's** id:
   ```
   applicationId "com.ivogomes.tapscore"
   ```
   (Leave the Kotlin `package` as `com.ivogomes.tapscore.wear` — only this `applicationId` must match the
   phone. This is what lets the watch pair with the phone app.)
2. Inside `dependencies { … }`, add the Wear Data-Layer library:
   ```
   implementation("com.google.android.gms:play-services-wearable:18.1.0")
   ```
3. A yellow bar appears saying **"Sync Now"** — click it and wait for the sync to finish.

> Just experimenting with the UI and don't care about phone control? You can skip step 6 entirely and keep
> the template's defaults.

### 7. Run it on a pretend watch (emulator)
1. Menu **Tools → Device Manager** → **Add a new device** (the **+**) → **Create Virtual Device** → pick
   the **Wear OS** category → choose any watch (e.g. *Wear OS Large Round*) → **Next** → pick a system image
   (download one if prompted) → **Finish**.
2. In the toolbar at the top, make sure the device dropdown shows your new watch emulator, then press the
   green **Run ▶** button.
3. First run installs everything and boots the watch — be patient. When it lands, you should see the
   **Home** screen: tap **Local match**, pick a sport, and tap **Start** to score. 🎉

> The watch's **"Control phone"** button won't connect yet — that needs the phone app installed and paired.
> Follow **[REMOTE.md](../tapscore-watch/REMOTE.md)** for the phone side.

### If something goes wrong
- **"duplicate class MainActivity" / two `@main`-like errors** → you didn't delete the template's starter
  MainActivity (step 4.3).
- **"Unresolved reference: ScoringEngine" (or MatchState)** → the engine file isn't in the `engine`
  package, or its first line isn't `package com.ivogomes.tapscore.engine`.
- **Red imports everywhere / "Sync failed"** → click **File → Sync Project with Gradle Files** and wait;
  if it mentions the Material3 or wearable library, re-check steps 5 and 6.2 then Sync again.
- **App runs but "Control phone" stays disconnected** → expected without the phone app; see REMOTE.md.

### (Optional) run the engine's tests
Copy `engine/ScoringEngineTest.kt` into `app/src/test/java/com/ivogomes/tapscore/engine/`, make sure
`dependencies` has `testImplementation("junit:junit:4.13.2")`, then in the Terminal tab run
`./gradlew test` (or right-click the test class → **Run**). Green means the Kotlin scoring rules match the
web app exactly.

### (Optional, advanced) engine as its own module
Instead of the `engine` sub-package in step 3, you can create a separate Kotlin/Android library module
`:engine`, put `ScoringEngine.kt` (and its test) there, and add `implementation(project(":engine"))` to the
app module. This keeps the pure scoring code free of Android bits and lets a future phone app share it.
Skip this unless you know why you want it.

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
code is written; assemble/test on device per [REMOTE.md](../tapscore-watch/REMOTE.md).

## Not yet wired (next steps)
- On-watch advanced format (points target, advantage rules, tie-break points) — v1 uses sensible
  defaults; full setup stays on the phone.
- Free-play "End match → winner/tie" entry point on the watch.
- A Tile / complication showing the live score.
```
