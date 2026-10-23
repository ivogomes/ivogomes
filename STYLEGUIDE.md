# Style guide

One look across the website and every tool (TMX Editor, Teleprompter, and any tool added later). A control behaves and looks the same wherever it appears. Change it here first, then in code.

Where things live:

| What | File |
| --- | --- |
| Colors, fonts, radius (shared tokens) | `src/tokens.css` |
| Tool tokens, tool header, logo marks | `src/tools.css` |
| Website components | `src/main.css` |
| TMX Editor controls | `tools/tmx-editor/styles.css` |
| Teleprompter controls | `tools/teleprompter/teleprompter.css` (`.tp-btn`, `.tp-range`, `.tp-switch`: plain HTML styled by the tokens, no third-party design system) |

Rules from the project still apply: no inline `<style>` / `<script>` / `style=""` in pages you author, and accessibility is first-class (see below).

## Principles

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
| `--hero-teal-soft` | `#A4D5CF` | Tool header background |
| `--hero-teal-ink` | `#16181C` | Text and outlines on any teal header |
| `--tool-danger` | `#B3261E` (light), `#F2867F` (dark) | Destructive actions only |

In tools, `--accent` is set to `--tool-teal-deep`. The vermillion accent (`#C8361A`) belongs to the website's own links and hovers; do not use orange or vermillion in tools. Per-speaker colors in the Teleprompter are data, not theme.

## Type

- Body and controls: Inter (`--font-sans`). Headings and logo text: Georgia (`--font-serif`), weight 400, tracking about -0.015em. Code and fixed-width data: JetBrains Mono (`--font-mono`).
- Button labels: 12px, weight 500, uppercase, 0.06em tracking.
- Small labels and table headers: 10px, uppercase, 0.16em tracking, muted.

## Buttons

Every button has the same shape: 2px radius, no border (secondary has a 1px border), 9px 18px padding, 12px uppercase label.

| Kind | Resting | Hover | Use |
| --- | --- | --- | --- |
| Primary | `--button-teal` bg, `--button-teal-ink` text | `--button-teal-hover` bg, text unchanged | The main action: Export, Download, Present, Open file |
| Secondary | Transparent, 1px `--rule-strong` border, `--ink` text | `--cream-2` bg | Everything else |
| Danger | `--tool-danger` bg, `--paper` text | Darker red (15% black mixed in) | Delete and other destructive actions |
| Icon | Secondary look, min 32px wide | As secondary | Undo, redo |
| Link | No background, `--accent` text, underline on hover | Underline | Inline actions |

- Text must stay readable on hover. Links styled as buttons (`<a class="pp-download-btn">`) must set their hover text color explicitly, because the global `a:hover` rule would otherwise turn it vermillion.
- Disabled: 40% opacity (60% on the website), `cursor: not-allowed`, no hover change.
- A primary button on a teal header keeps the same colors.
- Primary buttons everywhere carry the shimmer: a soft white sweep across the button on hover, 500ms (off under reduced motion, and not on disabled buttons). Website: `.pp-download-btn`. TMX: add `class="btn-primary"` (labels use `.file-btn`), defined in `src/tools.css`. Teleprompter: primary buttons are `.tp-btn.btn-primary`.

## Form controls

- Text input, search, select, textarea: 1px `--rule-strong` border, 2px radius, `--paper` bg, `--text`, Inter 13px. Focus: border turns `--accent` and the focus ring shows.
- Checkbox and radio: native control with `accent-color: var(--accent)`, 14px, pointer cursor, always with a text label.
- Toggle: square 48 x 28 track, `--button-teal` when on, muted when off, `--paper` thumb. Teleprompter: `.tp-switch` (a checkbox with `role="switch"`).
- Slider: 4px track, square thumb in `--button-teal` ringed in `--paper`. Teleprompter: `.tp-range`.
- Labels sit above or beside the control, never as placeholder-only.

## Focus, motion, accessibility

- `:focus-visible` on everything interactive: 2px solid `--accent` (or `--hero-teal-ink` inside a tool header), offset 2 to 3px. Never `outline: none` without a replacement.
- Transitions are 120 to 220ms, ease-out. Honour `prefers-reduced-motion` (drop animation, keep state changes).
- Text contrast 4.5:1, controls and rings 3:1. White on `--button-teal` is about 5:1.
- Semantic elements first (`button`, `a`, `label`, `dialog`), visible text or `aria-label` on every control, full keyboard operation.

## Tool header and logo

- Every tool starts with `.tool-header`: `--hero-teal-soft` background, `--hero-teal-ink` text, min height 72px, 40px side padding (16px on small screens), logo at the left, page controls at the right.
- The logo is a 24px flat ink square carrying the tool's glyph. Its lines take the surface behind it (`--mark-ground`) and one block in `--tool-teal`. The name sits beside it in Georgia 22px.
- Marks live in the tool page and on its card in `tools/index.html`. Keep the two identical.

## Adding or changing a control

1. Check this guide. If the control exists here, reuse it exactly.
2. If it is new, define it in the shared tokens or the shared tool stylesheet, add it here, then use it.
3. Apply the change to the website and every tool that has the control, not just the page you are on.
4. Check light and dark, keyboard focus, hover and disabled.

## Known deviations

- The Teleprompter's logo mark and header exist in the bundled `tools/teleprompter/index.html` as well as in `tools/teleprompter/app.html`; edit both.
