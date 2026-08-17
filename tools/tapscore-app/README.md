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

## Bundle the Outfit score font (recommended)

The web build loads Outfit from Google Fonts; the native build strips that
network call, so **without a self-hosted copy the score readout falls back to
system-ui**. To ship Outfit in the native apps:

```bash
npm run fonts   # downloads Outfit 600/700/800 woff2 + writes fonts/outfit.css (needs internet)
npm run sync    # copy-web.mjs auto-detects fonts/outfit.css and bundles it
```

`npm run fonts` runs `fonts/fetch-outfit.sh`, which pulls the exact woff2 files
Google serves and generates `fonts/outfit.css` (with `font-display: swap` and the
original `unicode-range` blocks). The downloaded binaries are git-ignored —
re-run `npm run fonts` on a fresh checkout. `copy-web.mjs` prints whether the
self-hosted font was found or it fell back to system-ui.

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
2. In the Play Console: create the app, complete the Data safety form,
   content rating questionnaire, store listing (icon, feature graphic
   1024x500, screenshots), and set category (Sports).
   ⚠️ Data safety is **not** "no data collected" once RevenueCat ships — declare
   purchase history + a device identifier, processed for app functionality. See
   the In-app purchases section below and `../tapscore/privacy.html`.
3. Roll out to internal testing first, then production.

---

## In-app purchases (TapScore Pro)

The app code is already written against **RevenueCat** — see the
`TapScore Pro (free trial ...)` block in `../tapscore/index.html`
(`configureBilling()`, `syncBilling()`, `Billing.purchase()/restore()`). It expects
entitlement id `pro`, a one-time product `pro_unlock`, and an offering marked
**Current** whose first package is that product.

Until the plugin is installed, `RCPurchases()` is `null`: the web/PWA build unlocks
Pro locally (intentional, so the flow is testable) and native builds refuse to sell
rather than giving Pro away.

**1. Install the plugin.** Already declared in `package.json` as
`@revenuecat/purchases-capacitor: ^9.2.1` — run `npm install && npm run sync`.

`9.2.1` is the **highest version compatible with Capacitor 6**: `10.0.0` moved its
`@capacitor/core` peer dep to `>=7.0.0` and the current `13.x` needs `>=8.0.0`. The
caret is deliberately capped below `10.0.0`; don't widen it without upgrading Capacitor
first. The plugin's `minSdkVersion` is 22, matching `variables.gradle`, so no bump.

⚠️ Worth checking at first upload: the 9.x line bundles
`purchases-hybrid-common:13.15.2`, and Google enforces a rolling minimum Play Billing
Library version. If Play Console rejects the AAB over the Billing version, the fix is to
upgrade Capacitor (6 ▸ 7 ▸ 8) and move to a newer plugin line — not to patch around it.

**2. Play Console — payments profile.** Setup ▸ Payments profile (bank account,
address, tax/NIF). Nothing can be sold without it and verification takes a few days,
so start here.

**3. Play Console — the product.** Monetize ▸ Products ▸ In-app products ▸ create
`pro_unlock` as a one-time purchase, set price + localized name/description, and
**Activate** it. Needs a release already uploaded to a track, built *after* step 1
(the Billing library ships with the plugin).

**4. Service account, so RevenueCat can verify purchases.** In Google Cloud: create a
service account, enable the Google Play Android Developer API, download the JSON key.
In Play Console ▸ Users & permissions: invite that service-account address with *View
financial data* and *Manage orders and subscriptions*. Upload the JSON to RevenueCat.
Permission changes can take ~24h to propagate.

**5. RevenueCat dashboard.** Add a Google Play app for `com.ivogomes.tapscore`, import
`pro_unlock`, attach it to an entitlement with the exact id `pro`, and add it to an
offering marked **Current**. Then replace `REVENUECAT_ANDROID_API_KEY` in
`../tapscore/index.html` with the public Android SDK key (`goog_…` — designed to be
client-side, so it's fine in this repo).

**6. Testing.** Play Console ▸ Setup ▸ License testing: add your accounts so purchases
are free. Purchases only work for builds **installed via Play** (internal testing or
internal app sharing) signed with the release key — a `npm run apk` debug install will
always fail.

**7. Don't forget the disclosures.** Adding RevenueCat means purchase and device
identifiers leave the device, so the Play **Data safety** answers ("no data collected")
and `../tapscore/privacy.html` both need revising before submitting.

Purchase acknowledgment — Google auto-refunds purchases left unacknowledged for 3 days —
is handled by the RevenueCat SDK.

---

## Bumping the version

Edit `package.json` version, then set the version/build in each native project
(Xcode General tab; `android/app/build.gradle` `versionCode`/`versionName`),
`npm run sync`, re-archive, resubmit.
