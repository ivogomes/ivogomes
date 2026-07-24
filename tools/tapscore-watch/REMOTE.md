# TapScore Remote (watch controls the phone) — Apple Watch + iOS

"Remote" mode: the Apple Watch controls the match running on the iPhone. The phone stays the source of
truth; the watch sends score/undo and mirrors the state the phone broadcasts, over **WatchConnectivity**.

```
message flow:  Watch (RemoteModel) ⇄ WCSession ⇄ WatchLinkPlugin (iOS) ⇄ WebView JS (window.__wcCommand / WatchLink.send)
protocol:      watch→phone {t:"score",side} · {t:"undo"} · {t:"sync"}
               phone→watch {t:"state", active, over, winner, names, you, opp, pill, server, sport}
```

## The one rule: the watch app must be a "companion" of the iOS app
Apple only lets a watch app talk to **its own host iPhone app**. A separate standalone watch project can't
reach the TapScore iPhone app. So we add the watch app **inside** the existing Capacitor iOS project
(`tools/tapscore-app/ios`) as an embedded **Watch App target**. That's the whole trick — do this and the
connection "just works" with no entitlements to toggle.

Never used Xcode much? Follow every sub-step; the tricky spots have callouts. Budget ~30 min.

### 1. Add a Watch App target to the iOS project
1. Open **`tools/tapscore-app/ios/App/App.xcworkspace`** in Xcode. ⚠️ Open the **`.xcworkspace`**, not the
   `.xcodeproj` — the workspace is what wires everything together.
2. In the left sidebar (Project navigator), **click the blue `App` project icon at the very top** so it's
   selected. *(Skipping this is the #1 cause of the empty dropdown in step 4.)*
3. Menu **File ▸ New ▸ Target…**. In the chooser, click the **watchOS** tab at the top, pick the **App**
   template (not Game/Framework/Extension), then **Next**.
4. On the options screen:
   - **Product Name:** `TapScore Watch`
   - **Interface:** SwiftUI · **Language:** Swift · **untick** any "Include Tests".
   - Choose **"Watch App for Existing iOS App"**, and in the dropdown below it pick **App** (your iPhone
     app). ⚠️ If that dropdown is **empty**, cancel, do step 2 (select the blue `App` project), and retry —
     it only lists apps from the selected project.
   - Click **Finish**. If Xcode asks to "Activate the … scheme", click **Activate**.
5. Xcode generated two starter files in the new watch folder — a `…App.swift` and a `ContentView.swift`.
   **Delete both** (Move to Trash). Ours (`TapScoreApp.swift`) is the real entry point; leaving the
   generated one causes a *"'main' attribute can only apply to one type"* error.
6. **Add our watch code.** In Finder open `tools/tapscore-watch/WatchApp/`. Drag these **five** files onto
   the new **TapScore Watch** folder in Xcode: `TapScoreApp.swift`, `MatchModel.swift`, `Views.swift`,
   `RemoteModel.swift`, `RemoteView.swift`. In the dialog: tick **"Copy items if needed"** and — important —
   tick the **TapScore Watch** target under *Add to targets* (untick the iOS "App" target). *(Theme and
   Haptics already live inside `TapScoreApp.swift` — there's no separate Theme file for Apple Watch.)*
7. **Attach the scoring engine** (this is two clicks that people miss — see the callout):
   - Menu **File ▸ Add Package Dependencies…** ▸ button **Add Local…** ▸ select the folder
     `tools/tapscore-watch/Engine` (the one with `Package.swift`) ▸ **Add Package**.
   - When asked which target gets the `TapScoreEngine` library, tick the **TapScore Watch** target.
   - ⚠️ **Referenced ≠ linked.** Adding the package only *references* it. Now confirm it's *linked* to the
     watch target: select the **TapScore Watch** target ▸ **General** ▸ **Frameworks, Libraries, and
     Embedded Content** ▸ if `TapScoreEngine` isn't listed, click **+** and add it. Skipping this gives
     *"Cannot find 'ScoringEngine' / 'MatchState' in scope"* and the whole build (including the iPhone app)
     fails.
8. Select the **TapScore Watch** target ▸ **General** ▸ set **Minimum Deployments = watchOS 10.0** (our code
   uses the `@Observable` macro, which needs 10.0+).

### 2. Turn on the phone↔watch bridge in the iOS app
The iPhone app needs a small plugin so the web score screen can talk to the watch.

1. **Add the two bridge files to the iOS app target.** This is a *classic* Capacitor project, so files
   aren't auto-included — you must add them by hand. In Xcode's navigator, **right-click the yellow `App`
   group** (the one containing `AppDelegate.swift`) ▸ **Add Files to "App"…** ▸ select
   **`WatchLinkPlugin.swift`** and **`MainViewController.swift`** (both already in `ios/App/App/`) ▸ **untick
   "Copy items if needed"** (they're already there) ▸ tick the **App** target ▸ **Add**.
2. **Point the app at our controller.** Open **`App/Base.lproj/Main.storyboard`**, click the single
   **Bridge View Controller** scene, open the **Identity inspector** (⌥⌘4), and set:
   - **Class:** `MainViewController`
   - **Module:** `App` (untick "Inherit Module From Target" if it's stuck on `Capacitor`).
   This is what registers the plugin (via `capacitorDidLoad()`). ⚠️ Skip it and the watch connects to
   nothing.
3. Nothing else to configure — `WatchConnectivity` links automatically; no capability or entitlement.

### 3. Give the watch app an icon (optional but recommended)
The watch target ships with an **empty** app icon, so it shows a blank gray circle in the watch's app grid
(easy to think it "didn't install"). Fix it: in Xcode select the watch target's **Assets** ▸ **AppIcon**,
and drag a **1024×1024 PNG** onto the single well. (`tools/tapscore-watch/AppIcon-1024.png` is ready to
use.)

### 4. Run and test
1. Pick the **TapScore Watch** scheme (top toolbar) with a **paired watch** as the destination and press
   **Run ▶** — this is what actually installs the app onto the watch. *(Running only the iPhone `App`
   scheme often does **not** put the app on the watch.)*
2. Also run the **App** scheme on the iPhone. Start a match on the phone.
3. On the watch open TapScore ▸ tap **Control phone**.
4. The watch shows "Open TapScore on your phone" until the iPhone app is open and reachable, then mirrors
   the score. Tap a side to score on the phone; Digital Crown = undo; long-press = menu.

> **Simulator caveat:** WatchConnectivity is unreliable between simulators — the UI loads but taps often
> don't deliver. To truly verify remote scoring, use a **real iPhone + Apple Watch** that are paired.

---

# TapScore Remote — Wear OS + Android

This makes the **Wear OS watch control the match on your Android phone**. The phone stays in charge; the
watch sends "point"/"undo" and shows a live copy of the score. They talk directly over Google's
**Wearable Data Layer** — no internet, no account.

```
Wear watch  ⇄  (Wearable Data Layer)  ⇄  Android phone app  ⇄  the web score screen
```

New to this? First build the plain Wear app by following
**[tools/tapscore-wear/README.md](../tapscore-wear/README.md)** — this page only adds the "talk to the
phone" wiring on top of that.

## The one rule that makes pairing work: same identity
Android will only let the watch app and the phone app talk if they are, to the system, **the same app
identity**. Concretely that means both must:
1. have the **same `applicationId`** → `com.ivogomes.tapscore`, and
2. be **signed with the same key** (the same keystore file).

If either differs, they simply won't find each other — no error, just silence. (The watch's *Kotlin*
package can stay `com.ivogomes.tapscore.wear`; it's only the `applicationId` in `build.gradle` that has to
match. See the [signing note](#about-signing-with-the-same-key) below for what "same key" means in
practice.)

## Part A — the Android phone app (already done for you)
Nothing to code here; it's already wired in this repo:
- `WatchLinkPlugin.java` — the piece that receives taps from the watch and forwards the score to it — is
  registered in `MainActivity.java`.
- `android/app/build.gradle` already includes the Wearable library
  (`play-services-wearable:18.1.0`).

You just need a fresh build of the phone app installed on the phone:
```bash
cd tools/tapscore-app
npm run apk      # builds a debug APK you can install on the phone
```
(For a store build it's `npm run aab`.)

## Part B — the Wear OS app (two small additions)
If you followed the Wear README's **companion** steps, you already did both of these — double-check them:

1. **The remote code is included.** Confirm `RemoteModel.kt` and `RemoteScreen.kt` are in the `wear`
   package alongside `MainActivity.kt`, `Screens.kt`, `Theme.kt`, `MatchModel.kt`. (The README's step 4
   copies all six, so this is usually already true. The "Control phone" button is already wired in.)
2. **The Wearable library is added.** In the Wear app's **module** `build.gradle` (`app/build.gradle`),
   inside `dependencies { … }`:
   ```
   implementation("com.google.android.gms:play-services-wearable:18.1.0")
   ```
3. **The app id matches the phone.** In the same `build.gradle`, inside `android { defaultConfig { … } }`:
   ```
   applicationId "com.ivogomes.tapscore"
   ```
   Click **Sync Now** after edits.

## Part C — run and test them together
1. Install the **phone app** on your Android phone (the `npm run apk` build from Part A).
2. Install the **Wear app** on a watch that is **paired to that same phone**:
   - **Real watch:** pair it to the phone first via the *Galaxy Wearable* / *Wear OS* phone app, then Run ▶
     from Android Studio onto the watch.
   - **Emulators:** in Android Studio's **Device Manager**, the Wear emulator has a **"Pair"** option to
     link it to a running phone emulator. Pair them, then run each app to its own emulator.
3. On the **phone**, start a match. On the **watch**, open TapScore and tap **Control phone**.
4. The watch should show the live score. Tap a side to score on the phone; use the rotating bezel / crown
   to undo. If it says "disconnected", see troubleshooting below.

### About signing with the same key
"Same key" matters mainly for **release** builds. For quick testing, if both apps are **debug** builds from
the same computer, Android Studio uses the shared debug keystore automatically — so they already match.
For anything you distribute, sign both the phone app and the Wear app with your **release keystore**
(`~/keystores/tapscore-release.jks`) so their identities line up.

## If the watch won't connect
- **Stuck on "disconnected / start a match"** → most often the two identities don't match: re-check the
  `applicationId` is `com.ivogomes.tapscore` on **both** apps and that they're signed the same way (both
  debug, or both your release key).
- **Watch and phone aren't paired** → the Data Layer needs them paired at the OS level (via the phone's
  watch app, or "Pair" in Device Manager for emulators). Being on the same Wi-Fi is not enough.
- **Score doesn't update** → make sure the phone app is **open and in the foreground** with a match
  running; the watch mirrors the live match, it can't start one.

## How it behaves (good to know)
- Taps deliver instantly while both apps are open; the phone also stashes the latest score, so the watch is
  up to date the moment you open "Control phone".
- Offline, the watch shows "disconnected" and waits — it does **not** fall back to its own standalone match
  while in remote mode. It resumes mirroring automatically when the phone is reachable again.
- The web/phone score screen is already wired for this; it simply does nothing until the phone app with the
  plugin is installed.
