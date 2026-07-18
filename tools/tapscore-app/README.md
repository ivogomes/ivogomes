# TapScore — native app (iOS + Android)

Wraps the existing [TapScore PWA](../tapscore/) in a native shell using
[Capacitor](https://capacitorjs.com). The web app runs essentially unchanged;
this project just produces the Xcode and Android Studio projects you submit to
the App Store and Google Play.

**One source of truth:** the web app in `../tapscore/` is the product. This
project *copies* it into `www/` at build time — you keep editing `../tapscore/`
as usual, and the site on ivogomes.com keeps working.

---

## What was already done for you

- Capacitor config, `package.json`, and a `copy-web.mjs` build script (this folder).
- Feature-gated native code added to `../tapscore/index.html` — **no-ops on the
  web**, and on device it uses native haptics, native keep-awake, native status
  bar, and hides the native splash. It also skips the service worker in the app.
- Fullscreen on both platforms: **Android** draws edge-to-edge in immersive mode
  (hidden system bars, dark window background, content into the display cutout —
  see `MainActivity.java` / `styles.xml`); **iOS** hides the status bar app-wide
  (`Info.plist`: `UIStatusBarHidden`) with a dark WebView background.

The steps below are the ones that need the network (npm registry) and, for iOS,
a Mac with Xcode — so they couldn't be run in this environment.

---

## Prerequisites

| | iOS | Android |
|---|---|---|
| Account | [Apple Developer](https://developer.apple.com/programs/) — **$99/yr** | [Google Play Console](https://play.google.com/console) — **$25 once** |
| Tooling | **macOS + Xcode** + [CocoaPods](https://cocoapods.org) (`sudo gem install cocoapods`) | [Android Studio](https://developer.android.com/studio) (+ JDK 17) |

Also: Node 18+ (you already have it).

---

## First-time setup

Run everything from this folder (`tools/tapscore-app/`):

```bash
# 1. Install Capacitor + plugins (needs network)
npm install

# 2. Build the web bundle into ./www
npm run copy:web

# 3. Create the native projects (one time each)
npx cap add ios
npx cap add android

# 4. Copy web assets + native plugins into both projects
npx cap sync
```

## Icons & splash screens

Source assets already live in [`assets/`](assets/) — `logo.png` (1024px app icon,
upscaled from `../tapscore/icon-512.png`) and `splash.png` / `splash-dark.png`
(2732px, the logo centered on the `#0b1220` theme background). Generate every
native size and sync them in:

```bash
npm run assets    # reads ./assets, writes launcher icons + splashes into ios/ + android/
npm run sync
```

To refresh them later, regenerate `assets/logo.png` (≥1024px) — ideally from a
true 1024px source rather than the upscaled 512 — and/or the splash PNGs, then
re-run the two commands above.

(`npm run assets` pulls `@capacitor/assets` on demand via `npx` — it's a one-time
generator, so it's intentionally not a permanent dependency; see the note below.)

## About `npm audit` warnings

`npm install` prints audit warnings — these are **build-tooling only** and never
ship in the app (the app is just the `www/` bundle). Almost all come from the
`@capacitor/assets` icon generator, which is why it's run via `npx` instead of
being installed. After a clean install you should see ~1 low-impact warning
(`tar`, pulled in by the Capacitor CLI to fetch official platform templates).
**Do not run `npm audit fix --force`** — it breaks the Capacitor CLI version.

## (Optional) Bundle the Outfit font for pixel-perfect parity

The web build loads Outfit from Google Fonts; the native build strips that
network call and falls back to the system font. To keep Outfit exactly:

1. Download the Outfit `600/700/800` woff2 files (e.g. from
   [google-webfonts-helper](https://gwfh.mranftl.com/fonts/outfit)).
2. Put them in `./fonts/` next to a `./fonts/outfit.css` with `@font-face`
   rules pointing at them (`font-display: swap`).
3. `npm run copy:web` auto-detects `./fonts/outfit.css` and wires it in.

---

## Run it

```bash
npm run run:ios        # build web + sync + launch iOS simulator
npm run run:android    # build web + sync + launch Android emulator
# or open the IDEs to run on a physical device / archive:
npm run open:ios
npm run open:android
```

**After any change to `../tapscore/`, re-run `npm run sync`** (copies the web
app into both native projects).

---

## Release signing (command line)

`android/app/build.gradle` reads signing credentials from a git-ignored
`android/keystore.properties`. Set it up once:

```bash
# 1. Create your upload keystore (keep the .jks OUTSIDE the repo). Uses Android
#    Studio's bundled JDK so `keytool` is on hand:
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
mkdir -p ~/keystores
"$JAVA_HOME/bin/keytool" -genkeypair -v \
  -keystore ~/keystores/tapscore-release.jks \
  -alias tapscore -keyalg RSA -keysize 2048 -validity 10000

# 2. Point the build at it:
cd tools/tapscore-app/android
cp keystore.properties.example keystore.properties
#   then edit keystore.properties: set storeFile to
#   /Users/<you>/keystores/tapscore-release.jks and fill in the passwords.
```

Then build signed artifacts from `tools/tapscore-app/`:

```bash
npm run sync
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk   (URL/sideload)
./gradlew bundleRelease     # -> app/build/outputs/bundle/release/app-release.aab (Google Play)
```

⚠️ **Back up `~/keystores/tapscore-release.jks` and its passwords.** Lose them and
you can never ship an update under the same Play listing — Google can't recover it.
Without `keystore.properties`, release builds are simply left unsigned (so CI and
teammates without the key still build fine).

## Distributing the APK via a URL (without Play Protect warnings)

Play Protect can't be silently bypassed for a raw APK download — that's by design.
The warning-free options:

- **Best — Play Store Internal testing track:** upload the `.aab`, get a shareable
  opt-in URL; installs go through Play, so no Play Protect prompt. Up to 100 testers,
  near-instant. Doubles as your path to production.
- **Firebase App Distribution:** URL/email invites for testers.
- **Raw APK from your own URL:** must be *release*-signed (above), users enable
  "install unknown apps," and they'll likely still tap **More details → Install anyway**
  until the app builds install reputation. Don't tell users to disable Play Protect.

---

## Submitting to the stores

### iOS (App Store)
1. In Xcode: set the **Team** (Signing & Capabilities), confirm bundle id
   `com.ivogomes.tapscore`, set version + build number.
2. Product ▸ Archive ▸ Distribute App ▸ App Store Connect.
3. In [App Store Connect](https://appstoreconnect.apple.com): create the app,
   add screenshots (6.7" + 5.5" required), description, keywords, category
   (Sports), age rating, and a **privacy policy URL** + App Privacy answers
   (TapScore stores data only on-device → "Data Not Collected").
4. Submit for review (~1–3 days). Note Apple's
   [4.2 minimum-functionality](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality)
   rule — the local bundle + native haptics/keep-awake help it read as a real app.

### Android (Google Play)
1. In Android Studio: Build ▸ Generate Signed Bundle (**.aab**), create an
   upload keystore (keep it safe — you can't rotate it later).
2. In the Play Console: create the app, complete the Data safety form
   (no data collected), content rating questionnaire, store listing
   (icon, feature graphic 1024x500, screenshots), and set category (Sports).
3. Roll out to internal testing first, then production.

---

## Bumping the version

Edit `package.json` version, then set the version/build in each native project
(Xcode General tab; `android/app/build.gradle` `versionCode`/`versionName`),
`npm run sync`, re-archive, resubmit.
