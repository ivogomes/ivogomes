# Style guide

One look across the website and every tool (TMX Editor, Teleprompter, and any tool added later). A control behaves and looks the same wherever it appears. Change it here first, then in code.

Where things live:

| What | File |
| --- | --- |
| Colors, fonts, radius (shared tokens) | `src/tokens.css` |
| Tool tokens (including the tools' `--f-*` palette), tool header, logo marks | `src/tools.css` |
| The tools' look for tools built on the site tokens: maps `--cream`, `--paper`, `--rule`, `--radius`, `--font-sans` and the rest onto `--f-*` | `src/tools-look.css` |
| Fin | `tools/finance/finance.css` |
| Website components | `src/main.css` |
| TMX Editor controls | `tools/tmx-editor/styles.css` |
| Teleprompter controls | `tools/teleprompter/teleprompter.css` (`.tp-btn`, `.tp-range`, `.tp-switch`: plain HTML styled by the tokens, no third-party design system) |

Rules from the project still apply: no inline `<style>` / `<script>` / `style=""` in pages you author, and accessibility is first-class (see below).

## Two looks: the website and the tools

The website is flat and square (the principles below). The tools (Fin, the TMX Editor and the Teleprompter) share Fin's look instead: a soft neutral page, white cards with a 12px radius and a soft shadow, 8px-radius controls, sentence-case buttons, Geist for text, and teal for action. Its colours are the `--f-*` tokens in `src/tools.css`, with dark values. Fin uses them directly; the TMX Editor and the Teleprompter load `src/tools-look.css`, which points the site tokens at them, so anything styled with `--paper`, `--rule-strong` or `--radius` follows. See [Tools](#tools) for the controls.

## Principles (website)

- Flat and square. 2px radius (`--radius`), no decorative shadows, no gradients.
- Warm greys for surfaces, teal for action, red only for danger.
- Quiet by default: one primary action per view, everything else secondary.
- Light and dark both work. Use tokens, never hardcode a color that has a token.

## Color

Neutrals come from `tokens.css` and switch with `prefers-color-scheme`: `--cream` (page), `--paper` (surfaces), `--cream-2` (raised or alternate), `--ink`, `--ink-soft`, `--text`, `--text-muted`, `--rule`, `--rule-strong`.

| Token | Value | Use |
| --- | --- | --- |
| `--button-teal` | `#1F7A8C` | Primary button, resting. Also checkbox, toggle and slider fill |
| `--button-teal-hover` | `#186577` | Primary button hover and pressed |
| `--button-teal-ink` | `#FFFFFF` | Text on a primary button |
| `--tool-teal-deep` | `--button-teal` (light), `#5BBFB5` (dark) | Focus rings, links, selected and modified signals, anything that must read on paper |
| `--tool-teal` | `#5BBFB5` | Light teal for fills only: logo block, search highlight, presenter guides. Never for text on paper (about 2:1) |
| `--hero-teal` | `#5BBFB5` | The home hero |
| `--hero-teal-soft` | `#A4D5CF` | The light-mode tool header teal |
| `--hero-teal-ink` | `#16181C` | Fixed dark ink for text on the light teals (header in light mode, search highlight) |
| `--tool-header-bg` / `--tool-header-ink` | `#A4D5CF` / `#16181C` (light), `#1B3836` / `#E4F1EF` (dark) | The tool header's background and text, outlines and borders. Use these, not the hero tokens, for anything on the header |
| `--tool-danger` | `#B3261E` (light), `#F2867F` (dark) | Destructive actions only |

Money amounts in Fin (the finance tool) are data, not theme: money in is green (`--f-pos`), money out is red (`--f-neg`), always with a visible sign so color is never the only cue. See Known deviations for the rest of Fin's look.

In tools, `--accent` is set to `--tool-teal-deep`. The vermillion accent (`#C8361A`) belongs to the website's own links and hovers; do not use orange or vermillion in tools. Per-speaker colors in the Teleprompter are data, not theme.

## Type (website)

- Body and controls: Inter (`--font-sans`). Headings and logo text: Georgia (`--font-serif`), weight 400, tracking about -0.015em. Code and fixed-width data: JetBrains Mono (`--font-mono`).
- Button labels: 12px, weight 500, uppercase, 0.06em tracking.
- Small labels and table headers: 10px, uppercase, 0.16em tracking, muted.

## Buttons (website)

Every website button has the same shape: 2px radius, no border (secondary has a 1px border), 9px 18px padding, 12px uppercase label.

| Kind | Resting | Hover | Use |
| --- | --- | --- | --- |
| Primary | `--button-teal` bg, `--button-teal-ink` text | `--button-teal-hover` bg, text unchanged | The main action: Export, Download, Present, Open file |
| Secondary | Transparent, 1px `--rule-strong` border, `--ink` text | `--cream-2` bg | Everything else |
| Danger | Looks like secondary: transparent, 1px `--rule-strong` border, `--ink` text | `--tool-danger` bg and border, `--paper` text. Red appears only on hover | Delete and other destructive actions |
| Icon | Secondary look, min 32px wide | As secondary | Undo, redo |
| Link | No background, `--accent` text, underline on hover | Underline | Inline actions |

- Text must stay readable on hover. Links styled as buttons (`<a class="pp-download-btn">`) must set their hover text color explicitly, because the global `a:hover` rule would otherwise turn it vermillion.
- Disabled: 60% opacity, `cursor: not-allowed`, no hover change.
- Primary buttons everywhere carry the shimmer: a soft white sweep across the button on hover, 500ms (off under reduced motion, and not on disabled buttons). This applies to the tools too. Website: `.pp-download-btn`. TMX: add `class="btn-primary"` (labels use `.file-btn`), defined in `src/tools.css`. Teleprompter: primary buttons are `.tp-btn.btn-primary`. Fin: `.fin-btn.btn-primary`.

## Form controls (website)

The behaviour (native controls, labels, `role="switch"`, `aria-pressed`) is the same in the tools; their shapes are under [Tools](#tools).


- Text input, search, select, textarea: 1px `--rule-strong` border, 2px radius, `--paper` bg, `--text`, Inter 13px. Focus: border turns `--accent` and the focus ring shows.
- Checkbox and radio: native control with `accent-color: var(--accent)`, 14px, pointer cursor, always with a text label.
- Toggle: square 48 x 28 track, `--button-teal` when on, muted when off, `--paper` thumb.
- Expandable group for secondary options: a native `<details>` whose summary is a link-style row with a chevron (`--accent` text), reading "More …" when closed and "Fewer …" when open. Teleprompter: `.tp-more`.
- Segmented choice (a few mutually exclusive options): a joined row of buttons in one 1px `--rule-strong` frame. The chosen one is `--button-teal` with `--button-teal-ink` text, set with `aria-pressed`.
- Slider: 4px track, square thumb in `--button-teal` ringed in `--paper`.
- Labels sit above or beside the control, never as placeholder-only.

## Focus, motion, accessibility

- `:focus-visible` on everything interactive: 2px solid `--accent` (or `--tool-header-ink` inside a tool header), offset 2 to 3px. Never `outline: none` without a replacement.
- Transitions are 120 to 220ms, ease-out. Honour `prefers-reduced-motion` (drop animation, keep state changes).
- Text contrast 4.5:1, controls and rings 3:1. White on `--button-teal` is about 5:1.
- Semantic elements first (`button`, `a`, `label`, `dialog`), visible text or `aria-label` on every control, full keyboard operation.

## Tool header and logo

- The Tools page (`tools/index.html`) is a grid of two columns (one on phones, below 40rem): one card per tool, wrapping onto new rows as tools are added. A card is an icon tile, a Georgia title and a short description. To add a tool, copy an existing `<li>` and keep the list in the order you want shown; the dashed "More on the way, maybe" teaser (`.tools-card--next`) is a plain `<div>`, not a link, and stays last.
- The tool header is sticky (`position: sticky; top: 0`) so it stays on screen while the page scrolls, and sits below any full-screen layer (z-index 5).
- Every tool starts with `.tool-header`: `--tool-header-bg` background (soft teal, deep teal in dark mode), `--tool-header-ink` text, min height 72px, 40px side padding (16px on small screens), logo at the left, page controls at the right.
- Under the header, a tool can have a secondary toolbar (`.tool-toolbar`: `--cream-2` background, 12px 40px padding, 10px gaps) for settings and status. The Teleprompter keeps its sync controls there, Present sits in the header, and deleting a script is an icon on each row of the script list (visible on hover, focus and touch).
- The logo is a 24px flat ink square carrying the tool's glyph. Its lines take the surface behind it (`--mark-ground`) and one block in `--tool-teal`. The name sits beside it in Georgia 22px.
- Marks live in the tool page and on its card in `tools/index.html`. Keep the two identical.

## Tools

The tools' controls match Fin's (`.fin-btn`, `.fin-input`, `.fin-switch`, `.fin-seg` in `tools/finance/finance.css`). The TMX Editor (`button`, `.icon-btn`, inputs in `styles.css`) and the Teleprompter (`.tp-btn`, `.tp-range`, `.tp-switch`, `.tp-seg` in `teleprompter.css`) follow the same values:

- Buttons: 8px radius, 8px 14px padding, Geist 13px weight 500, sentence case. Primary: `--f-accent` with `--f-accent-ink` text and a small shadow, `--f-accent-strong` on hover, plus the shimmer. Secondary: `--f-surface` with a 1px `--f-border-strong` border, `--f-hover` on hover. Danger: secondary with `--f-neg` text, `--f-danger-soft` and a `--f-neg` border on hover. Small: 5px 10px, 12px, 7px radius. Disabled: 45% opacity.
- On the teal header, secondary controls are a soft wash of the header ink (8%, 16% on hover) with no border.
- Inputs and selects: 8px radius, 1px `--f-border-strong`, `--f-surface`, 14px. Focus: `--f-accent` border and the `--f-ring` halo.
- Switch: a 36 x 20 pill, `--f-accent` when on, round `--f-surface` thumb. Slider: rounded 4px track, round `--f-accent` thumb.
- Segmented choice: a sunken pill row (`--f-surface-2`, 10px radius, 3px padding); the chosen option is raised on `--f-surface` with a small shadow.
- Cards and tables: `--f-surface`, 1px `--f-border`, `--f-radius` (12px), `--f-shadow`. Table headers are 12px muted, sentence case.
- Headings: Geist weight 650, tracking about -0.02em. The logo text stays Georgia.
- Labels are sentence case, 12 to 13px; no uppercase mono labels. Codes and attribute names stay in JetBrains Mono.

## Adding or changing a control

1. Check this guide. If the control exists here, reuse it exactly.
2. If it is new, define it in the shared tokens or the shared tool stylesheet, add it here, then use it.
3. Apply the change to the website and every tool that has the control, not just the page you are on.
4. Check light and dark, keyboard focus, hover and disabled.

## Known deviations

- The Teleprompter's logo mark and header exist in the bundled `tools/teleprompter/index.html` as well as in `tools/teleprompter/app.html`; edit both.
- Fin also has controls of its own that the other tools don't need yet: header sections as tabs, icon-only row actions that appear on hover or focus, and coloured category chips. Only Fin offers a picked theme (Settings → Display); the other tools follow the system.
