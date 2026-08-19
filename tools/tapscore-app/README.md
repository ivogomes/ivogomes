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

  Android 15 deprecated the old edge-to-edge surface, and Play reports it. So: no
  `statusBarColor` / `navigationBarColor` / `windowLayoutInDisplayCutoutMode` in the
  theme, `EdgeToEdge.enable()` instead of `setDecorFitsSystemWindows()`, and the bars
  are driven by `WindowInsetsControllerCompat`. Bar *styling* uses Capacitor 8's
  built-in **`SystemBars`** core plugin — `@capacitor/status-bar` is deliberately not
  installed, because its Android code still references the deprecated APIs.

The steps below are the ones that need the network (npm registry) and, for iOS,
a Mac with Xcode — so they couldn't be run in this environment.

---

## Prerequisites

| | iOS | Android |
|---|---|---|
| Account | [Apple Developer](https://developer.apple.com/programs/) — **$99/yr** | [Google Play Console](https://play.google.com/console) — **$25 once** |
| Tooling | **macOS + Xcode** + [CocoaPods](https://cocoapods.org) (`sudo gem install cocoapods`) | [Android Studio](https://developer.android.com/studio) (+ JDK 21) |

Also: Node 22+ (required by the Capacitor 8 CLI).

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
   ⚠️ Data safety is **not** "no data collected" — declare purchase history,
   processed for app functionality (the App Store / Google Play see it as the
   payment processor; no third party is involved). See the In-app purchases
   section below and `../tapscore/privacy.html`.
3. Roll out to internal testing first, then production.

---

## In-app purchases (TapScore Pro)

Purchases talk **directly** to each store — no third party. See the
`TapScore Pro (free trial ...)` block in `../tapscore/index.html`
(`configureBilling()`, `syncBilling()`, `Billing.purchase()/restore()`), which calls
a hand-rolled native plugin (`Cap.Plugins.Billing`) exposing the same four methods on
both platforms — `getProduct()`, `isOwned()`, `purchase()`, `restore()`:

- **Android:** `android/app/src/main/java/com/ivogomes/tapscore/BillingPlugin.java`,
  wrapping `com.android.billingclient:billing` (a direct Gradle dependency —
  `android/app/build.gradle`) — bump that version directly if Play ever raises its
  minimum, no plugin/Capacitor version chain to reason about.
- **iOS:** `ios/App/App/BillingPlugin.swift`, wrapping StoreKit 2 (a system
  framework — no pod, no third-party SDK at all).

Both talk to one product id, `pro_unlock`, a one-time non-consumable purchase — no
entitlements/offerings/dashboard to configure anywhere.

If `Cap.Plugins.Billing` doesn't exist (web/PWA build), Pro unlocks locally
(intentional, so the flow is testable); on native, a missing/broken plugin makes
`Billing.purchase()` throw rather than giving Pro away for free.

**1. Play Console — payments profile.** Setup ▸ Payments profile (bank account,
address, tax/NIF). Nothing can be sold without it and verification takes a few days,
so start here.

**2. Play Console — the product.** Monetize ▸ Products ▸ In-app products ▸ create
`pro_unlock` as a one-time purchase, set price + localized name/description, and
**Activate** it. Needs a release already uploaded to a track.

**3. App Store Connect — the product.** Features ▸ In-App Purchases ▸ create
`pro_unlock` as a **Non-Consumable**, set price + localized name/description/review
screenshot. It has to exist (doesn't need full App Review) before `Product.products(for:)`
returns anything in Sandbox.

**4. Testing.**
- Android: Play Console ▸ Setup ▸ License testing: add your accounts so purchases are
  free. Purchases only work for builds **installed via Play** (internal testing or
  internal app sharing) signed with the release key — a `npm run apk` debug install,
  or `Run` from Android Studio on an emulator, will always fail with `BILLING_UNAVAILABLE`.
- iOS: App Store Connect ▸ Users and Access ▸ Sandbox ▸ Testers: create a sandbox
  tester Apple ID, sign into it under Settings ▸ App Store ▸ Sandbox Account on the
  test device (prompted at purchase time, not beforehand).

**5. Don't forget the disclosures.** Purchase history still leaves the device (to
Apple/Google, as the payment processor) so the Play **Data safety** answers ("no data
collected") and `../tapscore/privacy.html` both need to say so — but neither needs a
third-party mention anymore.

Purchase acknowledgment — Google auto-refunds a purchase left unacknowledged for 3
days — is handled by `BillingPlugin.isOwned()`, which acknowledges any unacknowledged
purchase every time it runs (app launch, Restore tap, and right after a successful
purchase). iOS has no separate acknowledgment step — `transaction.finish()` at
purchase time is sufficient.

---

## Bumping the version

Edit `package.json` version, then set the version/build in each native project
(Xcode General tab; `android/app/build.gradle` `versionCode`/`versionName`),
`npm run sync`, re-archive, resubmit.
