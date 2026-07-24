# TapScore Remote (watch controls the phone) — Apple Watch + iOS

"Remote" mode: the Apple Watch controls the match running on the iPhone. The phone stays the source of
truth; the watch sends score/undo and mirrors the state the phone broadcasts, over **WatchConnectivity**.

```
message flow:  Watch (RemoteModel) ⇄ WCSession ⇄ WatchLinkPlugin (iOS) ⇄ WebView JS (window.__wcCommand / WatchLink.send)
protocol:      watch→phone {t:"score",side} · {t:"undo"} · {t:"sync"}
               phone→watch {t:"state", active, over, winner, names, you, opp, pill, server, sport}
```

## Prerequisite: the watch app must be a companion target of the iOS app
WatchConnectivity only links a watch app with **its host iOS app**. The standalone watch project can't
talk to the Capacitor iOS app — so the watch app has to live **inside** `tools/tapscore-app/ios` as an
embedded Watch App target.

### 1. Add a Watch App target to the Capacitor iOS project
1. Open `tools/tapscore-app/ios/App/App.xcworkspace` in Xcode.
2. **File ▸ New ▸ Target… ▸ watchOS ▸ App** → Next.
   - Product Name: `TapScore Watch` · Interface **SwiftUI** · Language **Swift** · **untick** tests.
   - "Embed in Companion Application" → **App** (the iOS target). Finish → Activate the scheme.
3. **Delete the generated** `*App.swift` / `ContentView.swift` in the new watch target (our `TapScoreApp.swift`
   is the real `@main`).
4. Add our sources to the **watch target**: from `tools/tapscore-watch/WatchApp/` add
   `TapScoreApp.swift`, `MatchModel.swift`, `Views.swift`, `Theme.kt`… → the Swift files
   (`TapScoreApp.swift`, `MatchModel.swift`, `Views.swift`, `RemoteModel.swift`, `RemoteView.swift`, and the
   `Theme`/`Haptics` from `TapScoreApp.swift`). Tick the **watch** target under *Add to targets*.
5. Add the **engine**: File ▸ Add Package Dependencies… ▸ Add Local… ▸ `tools/tapscore-watch/Engine` ▸ add
   `TapScoreEngine` to the **watch** target. (Set the watch target's Minimum Deployments to **watchOS 10+**
   for the `@Observable` macro.)

### 2. Register the WatchLink plugin in the iOS app
1. Add `WatchLinkPlugin.swift` and `MainViewController.swift` (already in `ios/App/App/`) to the **App**
   (iOS) target if they aren't shown — they should be picked up automatically.
2. In `Main.storyboard`, select the **Bridge View Controller** ▸ Identity inspector ▸ set **Custom Class =
   `MainViewController`** (module: App). This registers the plugin via `capacitorDidLoad()`.
3. `WatchConnectivity` links automatically from the `import` — no entitlement needed.

### 3. Run
- Build & run the **iOS app** on an iPhone (or simulator), and the **watch app** on the paired watch
  (or paired simulator). Start a match on the phone, then on the watch choose **Control phone**.
- The watch shows "Open TapScore on your phone" until the iOS app is foregrounded and reachable, then
  mirrors the score. Tapping a side scores on the phone; Digital Crown = undo; long-press = menu.

---

# TapScore Remote — Wear OS + Android

Same protocol, over the **Wearable Data Layer** (`MessageClient`, path `/tapscore`).

```
Wear (RemoteModel) ⇄ MessageClient ⇄ WatchLinkPlugin (Android) ⇄ WebView JS
```

## Prerequisite: matching identity
The Data Layer only links a watch app with the phone app when they share the **same applicationId** and
are signed with the **same key**. So the Wear module's `applicationId` must be **`com.ivogomes.tapscore`**
(the Kotlin package can stay `com.ivogomes.tapscore.wear` — only the applicationId must match). Use the
same release keystore for both.

## Android phone app (already wired)
- `WatchLinkPlugin.java` (Capacitor plugin, `MessageClient` foreground listener) is registered in
  `MainActivity.java` (`registerPlugin(WatchLinkPlugin.class)` before `super.onCreate`).
- `app/build.gradle` has `implementation "com.google.android.gms:play-services-wearable:18.1.0"`.
- Rebuild: `npm run apk` / `npm run aab`.

## Wear OS app
1. In the Wear module, add these to `WearApp/`: `RemoteModel.kt`, `RemoteScreen.kt` (plus the existing
   MainActivity/Screens/Theme/MatchModel). MainActivity/Screens already route remote mode + the
   "Control phone" button.
2. Add to the **Wear module** `build.gradle`:
   `implementation "com.google.android.gms:play-services-wearable:18.1.0"`.
3. Set the Wear module `applicationId = "com.ivogomes.tapscore"` and sign with the same keystore.
4. Run the Wear app on a paired watch/emulator, start a match on the phone, then choose **Control phone**.

## Notes
- `sendMessage` delivers instantly while both apps are foreground/reachable; the phone also stashes the
  latest state via `updateApplicationContext`, so the watch is current the moment it opens.
- Offline behaviour: the watch shows a "disconnected / start a match" state and stays in remote mode
  (no standalone fallback) — resumes mirroring on reconnect.
- The web/phone side is already wired (`window.__wcCommand`, `sendWatchState()` → `Capacitor.Plugins.WatchLink.send`);
  it's a no-op until this plugin is registered.
- `npx cap sync` only touches web assets — the watch target and native plugin persist in the Xcode project.
