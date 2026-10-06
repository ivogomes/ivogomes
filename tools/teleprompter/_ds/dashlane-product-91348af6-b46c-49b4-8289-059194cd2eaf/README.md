# Dashlane Design System

A distilled, design-ready snapshot of **Dashlane's** product design system — colors, type, components, iconography, and reusable UI kits for prototyping product surfaces and marketing materials.

Dashlane is a password-manager and credential-security product (consumer + business). This system backs every Dashlane surface: web app (vault, admin console), browser extension, iOS & iPadOS apps, Android app, and the marketing site. The brand voice is calm, confident, and "security made simple" — no dark patterns, no fear-mongering, no noise.

## Sources this system was built from

- **Codebase** `Design System/design-system/` — the `@dashlane/design-system` React + theme-ui library. Contains all **design tokens** (`design-tokens/`), **components** (`src/components/*`), **fonts**, **logos**, and **illustrations** (`assets/illustrations/`). Host repo: `gitlab.dashlane.com/dashlane/teams/code/webproduct/design-system/design-system`.
- **Design tokens workspace** `Design System/design-tokens/` — the tokens studio export feeding the library.
- **Figma** `[PRDCT] 🕸 Web Kit.fig` — web components (Web-components-use-these).
- **Figma** `[PRDCT] 🍎 Apple Kit.fig` — iOS/macOS components.
- **Figma** `[PRDCT] 🤖 Android Kit.fig` — Android components.
- **Figma** `[UNIV] ⚛️ Universal assets.fig` — logos, illustrations, decorative grid, thumbnails.
- **Documentation** `ds-documentation/` — the official Dashlane DS Docusaurus site (zeroheight export): token, component, pattern, accessibility, and content/UX-writing guidelines. This is the authoritative source for voice, tone, and per-platform specs.
- Public docs: https://designsystem.dashlane.com

## Index (this folder)

- `README.md` — this file.
- `SKILL.md` — load-bearing instructions when this system is used as a Claude skill.
- `colors_and_type.css` — CSS custom properties and type classes covering every Dashlane DS token. **Start here in any prototype.**
- `fonts/` — Public Sans (body), GT Walsheim Pro (heading), Apercu Mono Pro (mono). Woff2 only.
- `assets/` — logos (lockup, logomark), illustrations, sample app icons.
- `preview/` — small HTML cards rendered by the Design System tab (type, colors, components, brand).
- `ui_kits/web/` — Dashlane Vault (web) — sidebar, vault list, detail pane, generator.
- `ui_kits/ios/` — iOS passwords app — list, detail, generator, autofill sheet.
- `ui_kits/android/` — Android passwords app — list, detail, settings, autofill.
- `references/` — cross-platform expert context: `components.md` (the full component matrix with Web/Android/iOS code + Figma links), `patterns.md` (TAC / Vault / mobile starter screens), `ux-vision.md`, and `ios-prototype.md` / `android-prototype.md` (how to scaffold native prototypes).

## Components

Reusable React primitives live under `components/<group>/` (each `<Name>.jsx` + `<Name>.d.ts` + a preview card). They're compiled into the runtime bundle and reachable in consuming projects via `window.<Namespace>.<Name>`. All styling reads the `--ds-*` tokens from `colors_and_type.css`; interactive states (hover/active/focus) are handled in-component. Full moods (`brand · neutral · danger · warning · positive`), intensities (`catchy · quiet · supershy`), and sizes are supported where the source defines them.

- **Icon** (`components/icon/`) — `Icon`. Friendly-named glyph set drawn from the Dashlane icon tokens.
- **Actions** (`components/actions/`) — `Button`, `LinkButton`.
- **Feedback** (`components/feedback/`) — `Badge`, `Tag`, `Infobox`, `Banner`, `Toast`, `Tooltip`.
- **Loaders** (`components/loaders/`) — `IndeterminateLoader` (circular spinner), `FiniteLoader` (determinate bar).
- **Forms** (`components/forms/`) — `TextField`, `PasswordField`, `SearchField`, `TextArea`, `SelectField`, `Checkbox`, `Radio`, `Toggle`, `Slider`, `DateField`, `PinField`, `OtpField`. Read-only display family: `DisplayField`, `PasswordDisplayField`, `ObfuscatedDisplayField`, `OtpDisplayField`, `DisplayArea`.
- **Layout** (`components/layout/`) — `Flex`, `Card`, `Divider`, `Dialog`, `Breadcrumb`, `PageHeader`, `DecorativeGrid`.
- **Data** (`components/data/`) — `List`, `ListItem`, `Table`, `Pagination`, `Tabs`, `Stepper`, `DropdownMenu`, `ItemHeader`, `EditorialItem`. Charts: `LineChart`, `AreaChart`, `BarLineComposedChart`, `CategoryBarChart`, `StackedBarChart` (also grouped as `Charts`).
- **Navigation** (`components/navigation/`) — `Navigation` (product left sidebar).
- **Brand** (`components/brand/`) — `Logo` (logomark + lockup, inlined from the real asset).
- **Expressive** (`components/expressive/`) — `ExpressiveIcon`, `ExpressiveNumber`, `SquircleContainer`, `Thumbnail`, `HighlightText`, `PasswordStrength`, `Countdown`, `SpaceIndicator`.
- **Typography** (`components/typography/`) — `Heading`, `Paragraph`.

The full documented web component set is now ported. Notes on the latest pass: `PinField` is the fixed-length code input (masked by default), `OtpField` is a visible auto-submitting preset of it for 2FA codes; the `Display*` family is read-only (the counterpart of the input fields — don't mix Display and Text fields on one page); `Charts` are pure-SVG implementations of the documented API (line, area, bar+line, category bars, stacked bar) that resolve `ds.chart.*` color tokens — they don't depend on Recharts.


## CONTENT FUNDAMENTALS

> Authoritative source: `ds-documentation/docs/content/` (voice-and-tone, style-and-formatting, word-list, ux-writing). Dashlane defaults to the **AP Stylebook** for anything not covered here.

Dashlane's voice is **plain, confident, and helpful** — "voice is our personality, tone is our mood. Voice is constant, tone is fluid." The tone shifts by audience (a B2B admin vs. a B2C customer hitting an error) but the voice stays recognizable: a security expert who refuses to make you feel dumb. Copy is short, conversational, and prefers verbs over nouns.

**Casing**
- **Sentence case** for every title, heading, button label, tab, toast, and menu item. Capitalize only the first word and proper nouns. NO SHOUTY CAPS (except acronyms like VPN, SSO, 2FA).
- **Feature, product, and plan names are Title Case** because they're unique/branded: **Dark Web Monitoring**, **Password Health**, **Business plan**, **Business Space**, **Dashlane Authenticator**, **Sharing Center**. Match the exact casing of a term as it appears in the UI.
- **Master Password** is capitalized (the one exception to avoiding the word "master").

**Pronouns & person**
- **You / your** — speak directly to the reader, friendly "we're-here-to-help" voice. (In some B2B content, "an admin" reads clearer than "you.")
- **We / our** for Dashlane itself.
- **They / their / them** as the gender-neutral singular. Use gender-neutral names in placeholder text.
- Avoid indefinite pronouns (it, this, these, those) at the start of a sentence — attach a noun: "This list", "These examples". Replace "it" with the actual noun whenever possible (helps translators).
- Don't start sentences with "There is"/"There are" — use specific language.

**Word choices (from the word list)**
- **Select**, never "click" or "tap" (inclusive of keyboard / voice / switch users).
- **Turn on / turn off**, not "enable / disable".
- **Log in to** (verb), **login** (noun/adjective). A **login** = a username/password combo stored in Dashlane; an **account** = the Dashlane account itself.
- **Autofill** (one word). **Back up** (verb) / **backup** (noun). **Set up** / **setup**. **Sign up** / **signup**.
- **2-factor authentication (2FA)** on first use, then **2FA** — never "two-factor".
- **Make sure** (not "ensure"). **Because** (reason) vs. **since** (time). **After**, not "once". **Before**, not "prior to". **To**, not "in order to".
- **Encrypt / decrypt** explained in plain language ("scrambles your data so no one can read it"). **Token** / **authentication code** for OTP/2FA codes; **recovery codes** for the 10 setup codes.
- Use **block list / allow list** (not blacklist/whitelist), **ethical hacker** (not white hat).
- Say **organization** or **business**, not "company".

**Punctuation**
- **Oxford comma**, always. ("your parents, Oprah, and Justin Timberlake.")
- **Em dash (—)** for asides and breaks; **en dash (–)** for ranges (1993–1994), no spaces. Lowercase the word after an em dash unless it's a proper noun.
- **Exclamation points**: extremely sparing — "if everything is urgent, then nothing is urgent." When in doubt, use a period.
- **No** semicolons, **no** ampersands (in articles), **no** chevrons (`>`) for navigation paths ("In the **My account** menu, select **Settings**…"), **no** Latin abbreviations (write "for example", "and so on" — never e.g./i.e./etc.), **no** slashes for choices ("State or Province"), **no** ellipses to imply "and so on", **no** asterisks.
- Periods go **inside** quotation marks. No periods on titles, headings, button labels, or single-sentence bullet list items.
- **please** is allowed only when something is Dashlane's fault ("Please try again").

**Numbers**
- Spell out zero–nine in body copy; use figures for 10+. Use figures before units (5 MB) or for input. Commas over three digits (1,000). Percentages attach to the number (10%). Currency uses symbols and drops .00 ($4, not $4.00).

**Writing for UI** (ux-writing): write for small screens first; write for scanners and skimmers (title + CTA should convey the gist); set clear expectations (steps, reversibility, points of no return); never use deceptive patterns; in-line links are not used in product — use the Link button / Button component instead (the only exception is a policy checkbox next to a link).

**Vibe**: quietly opinionated, no fluff, trusts you to be competent. The product has opinions about security so you don't have to.

**Don't**
- No "effortlessly", "seamlessly", "supercharge", "unlock the power of", "sunset" (tech jargon).
- No fake urgency ("Hurry!", "Only today").
- No emoji as bullets or status icons — use Dashlane's icon set.
- No directional language ("above", "below", "the button on the right") — reference elements by name or step number (accessibility).

## VISUAL FOUNDATIONS

### Color
Color is **token-based** — never use raw palette values. Every token is named by four levels: **nature** (`text`, `container`, `border`, `background`, `oddity`) · **mood** (`neutral`, `brand`, `danger`, `warning`, `positive`, `inverse`, `oddity`) · **intensity** (`catchy`, `standard`, `quiet`, `supershy`) · **state** (`idle`, `hover`, `active`, `disabled`). Example: `ds.container.expressive.brand.catchy.idle`.

Dashlane's brand sits on a single **teal/aquamarine** — `rgb(12, 125, 140)` (`--ds-brand-base`). It's used for primary buttons, focus rings, links, and selected states; almost never as a background wash. Everything else is neutral grays (`rgb(33, 37, 41)` catchy ink, `rgb(74, 91, 105)` quiet, `rgb(246, 249, 250)` alternate background). Semantic moods: danger `rgb(217, 50, 72)`, positive `rgb(5, 128, 99)`, warning `rgb(178, 87, 41)`. **Intensity in practice:** `catchy` = filled / highest contrast (titles, password letters, solid buttons); `standard` = default body & component text; `quiet` = secondary text (labels, eyebrows, placeholders, captions, decorative icons); `supershy` = near-invisible until hover (ghost buttons). There is also a **decorative** palette (8 hues — black, blue, green, grey, orange, purple, red, yellow) for account/category avatars and icon backgrounds, and a **chart** palette of 6 hues × 8 shades for data viz. Light and dark themes are both derived from one palette; light is the default.

### Typography
Text styles are **identical in name and rule across platforms** — `title/section/medium` means the same thing on Web, iOS, and Android — but each platform renders them in its **native typeface**. The brand and monospace roles are intentional, the platform role is native:

| Role | Web | Apple (iOS/macOS) | Android |
| --- | --- | --- | --- |
| **Platform** (titles, body, buttons, nav) | Public Sans | **SF Pro** | **Roboto** |
| **Brand** (specialty/brand only) | GT Walsheim Pro | GT Walsheim Pro | GT Walsheim Pro |
| **Monospace** (passwords, 2FA, card numbers) | Apercu Mono Pro | **SF Mono** | **Roboto Mono** |

Weights used: Regular (400), Medium (500), Semibold (600); GT Walsheim Pro is Medium only.

The four style families (use these names, not raw px values — values are platform-dependent and will become responsive):
- **Body** — the workhorse. `standard` for nearly all product copy; `reduced` only when space/hierarchy demands it; `helper` for labels, captions, footnotes, legal. Variants: `regular`, `strong` (emphasize keywords inline — not for aesthetics), `link` (Web only), `monospace`.
- **Title** — page-structuring landmarks (map to H1–H6 on web). `section` (page/area titles, large or medium interchangeably), `block` (cards/subsections), `supporting` (semantic landmark that shouldn't visually stand out, uppercase).
- **Specialty** — decorative attention-grabbers, max once per screen. `brand` (GT Walsheim Pro — milestones: login, signup, success), `spotlight` (key numbers, testimonials, URLs), `monospace` (large passwords, 2FA, percentages).
- **Component** — internal-only styles for DS components (button, badge, link). Never use directly in mockups.

Letter-spacing is tight at large sizes (-0.02em specialty, -0.01em section titles, 0 body). All-caps is reserved for badges and supporting-small labels at +0.03em. **Links don't exist on mobile** — use the Link button component on Apple/Android.

### Spacing & layout
4px base grid. Common steps: 4, 8, 12, 16, 24, 32, 48, 64. Dense product density (buttons 10/12px padding at medium, 14/16px at large). Content pages use a single-column layout at ~720px or 960px for admin. Page headers are left-aligned, never centered, with a small breadcrumb above. Mobile app gutters are 16px.

### Corner radii
Tight. **4px** on buttons, inputs, badges, tags, small cards. **8px** on content cards, infoboxes, dialogs. Never capsule-shaped buttons. Avatar/thumbnail squares use 8–12px. There's a **"squircle" container** (iOS-style continuous corner) used for app-icon thumbnails — see `squircle-container` component.

### Borders
1px borders, never 2px. Default border is `rgba(129, 145, 158, 0.5)` — a soft warm-gray. Input borders darken on hover (`rgb(129, 145, 158)`) and active (`rgb(102, 114, 124)`). Focus replaces the border with a 2px teal outline offset by 3px (`outline-offset: 3px`) — a very Dashlane-specific detail.

### Shadows / elevation
Subtle and short. Elevation is `0 2px 8px rgba(137, 138, 141, 0.18)` for most cards, dialogs use `0 16px 48px rgba(0,0,0,0.24)`. Modals use a **full-viewport overlay** at `rgba(33, 37, 41, 0.24)` (light) — not pure black. There is no "neumorphism" / inner shadow system. Capsules are not used in place of protection gradients.

### Imagery
Illustrations are **WebP**, 2x, hand-drawn flat shapes with a **warm-neutral** palette and brand-teal accents. They come in **light and dark** variants (see `assets/illustrations/`). There is a **"decorative grid"** component — a subtle dotted/line grid used as a background motif on marketing and empty states. No photography in product UI. No gradients except in charts.

### Animation
**Short** (150–220ms) **ease-out** (`cubic-bezier(0.2, 0, 0, 1)`). Applied to color transitions on hover/focus/active; outline-offset also transitions on focus. No bounces. No spring. Loaders are an **indeterminate linear bar** or a **spinner** at three sizes. Skeletons fade softly. Toasts slide + fade from bottom-right. Dialogs fade in from `opacity: 0, scale: 0.98`.

### States
- **Hover**: background steps one shade darker (container-hover token, not opacity).
- **Active / pressed**: one more shade darker (container-active). No scale-down.
- **Focus-visible**: 2px teal outline, 3px offset — very recognizable.
- **Disabled**: content color → `rgba(129, 145, 158, 0.7)`; container → `catchy-disabled` (10% of its brand color). Cursor `not-allowed`. No strike-through.

### Backgrounds & surfaces
- Page background is **white**, with an occasional `rgb(246, 249, 250)` alternate (settings, empty states).
- Cards are **white** with a 1px neutral-quiet border and `--ds-shadow-sm`. Not shadow-only, not border-only — both, subtle.
- No full-bleed hero imagery inside product UI. Marketing uses full-bleed illustration panels.
- Transparency/blur is used in one place only: **iOS/macOS system modals** (native). The web app does not use backdrop-blur.

### Fixed elements
- Primary nav is a **left sidebar** on web, 244px wide, white with subtle hover tint.
- Top bar on web is 56px, white, with a search field on the right.
- Mobile uses a **bottom tab bar** (iOS/Android native patterns).
- Dialogs center vertically at max-width 480–560px.

## ICONOGRAPHY

Dashlane ships its **own icon library** — 80+ outline glyphs, 20 and 12 variants, optical-adjusted. Names include: `vault`, `passkey`, `password`, `pin-code`, `recovery-key`, `face-id`, `fingerprint`, `sso`, `risk-detection`, `health-positive/negative/unknown`, `arrow-*`, `caret-*`, `shared`, `group`, `collection`, `import`, `download`, `upload`, `dashboard`, `settings`, `notification`, `phishing-alert`, `laptop`, `laptop-checkmark`, `yubikey`, `chrome`, `microsoft-edge`, `qr-code`, `formatting`, and many more (full list in `design-tokens/icons/`). All icons are **single-path SVGs** drawn on a 20×20 grid (also rendered at 12×12 `xsmall` and 24×24 when needed), **1.5px stroke**-weight in outline form, **filled** variants for active/selected states.

**Rules**
- **Never** use emoji in product UI.
- **Never** use unicode glyphs as icons (no `⚙`, no `✓`).
- Use the Dashlane set first. If a glyph doesn't exist, fall back to **Lucide** (closest visual match — same outline weight, 2px stroke) and flag the substitution.
- Icons inherit `currentColor`. Size via `--ds-icon-{xsmall|small|medium|large}` tokens.

**App icons** (Dashlane app on iOS/Android/macOS/Windows) — rounded-square with gradient teal + the 6-bar logomark. Stored in `assets/app-icon-*.png`.

**In this system**: we reference the full icon set from its source in the codebase (`design-tokens/icons/`). For prototypes that don't import the codebase, use **Lucide CDN** as a drop-in with matching weights — flagged as a substitution.

## Known caveats & flags

- **Fonts**: GT Walsheim Pro and Apercu Mono Pro are **licensed**. The woff2 files in `fonts/` are copies from Dashlane's internal repo and are included here for prototyping fidelity. For public publishing, substitute GT Walsheim Pro with a closest match (e.g. Geist, Inter Display) and Apercu Mono with IBM Plex Mono. Public Sans is open-licensed and fine to ship.
- **Illustrations**: light+dark WebP variants exist for all 22 of the key illustrations. They're in `assets/illustrations/`.
- **Icons in the UI kits**: the UI kits reference Lucide icons via CDN for portability. The codebase's native SVG set is shipped in `assets/icons/` for projects that want the real ones.
- **Decorative grid** is now a real component (`DecorativeGrid`, `components/layout/`) — a corner-anchored, mood-tinted CSS grid with a radial fade. The Figma frame remains the visual reference.
- **DateField calendar glyph**: the Dashlane icon set ships no calendar glyph, so `DateField` inlines a 1.5px-stroke calendar icon matching the DS outline weight (flagged substitution). Swap for the real glyph if/when it's added to the icon tokens.
- **UX patterns** (bulk actions, intro screens, paywalls, loading) from the DS documentation are summarized in `references/patterns.md` under **UX Patterns** — compositions of existing components, not new components.
