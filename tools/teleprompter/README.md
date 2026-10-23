# Teleprompter

Write and save scripts, read them with scrolling text you can resize and mirror, and keep your phone awake while presenting.

| File | What it is |
| --- | --- |
| `index.html` | The page that ships (`/tools/teleprompter/`). A self-contained bundle of `app.html`, the runtime and React. Edit `app.html` first, then apply the same change here (see below). |
| `app.html` | Source of the whole app: script list, editor, appearance settings, sync, and the full-screen presenter view. |
| `default-script.txt` | The text of the app's default script, titled "Example Script", in the app's text format. Paste it into a new script to reuse it. |
| `teleprompter.css` | The tool's styles: buttons (`.tp-btn`), slider (`.tp-range`), toggle (`.tp-switch`) and the header sync controls, all built on the site tokens. Loaded by the page. |
| `runtime.js` | Generated runtime that renders `app.html`. Do not edit. |
| `.thumbnail` | Preview image for the design tool. |

## Using it

- **Timer:** the script card shows a reading-time estimate (spoken lines only, at the "Speaking pace" setting). While presenting, a timer counts up next to the line counter. Click it or press `P` to pause and resume. It resets each time you press Present.
- **Import and export:** "Import .txt" in the sidebar creates a new script from a text file, titled from the file name. "Export .txt" in the script card downloads the current script in the same format as `default-script.txt`.
- **Display settings:** the Settings card shows background, text size and speaking pace, and keeps the rest behind "More display options" (a native expand control) so the Preview and Speaker colors stay near the top. Inside it: font (Sans, Serif or Mono), text size, line spacing, margins (the text column is 100% minus the margin on each side), and the reading line, which is where the current line sits, as a percentage from the top. Mirror flips left to right and "Flip upside down" flips top to bottom, and they can be combined. With the screen flipped, the reading line is measured from the edge you see as the top. The Preview is a miniature of the presenter. It shows the current line with a few lines either side, dimmed the way the presenter dims them, and the ‹ › arrows in its header step through the script. The arrows move the same position the presenter uses, so pressing Present starts from the line the preview is showing. The preview follows every setting: background, font, size, line spacing, margins, mirror and flip, "Show upcoming line", and the reading line (the dashed guide). It scales like a 1280px-wide screen, so on a phone the real text is scaled down further. "Reset to defaults" at the top of the Settings card restores every setting (size 72, Dark, Sans, line spacing 1.2, margins 6%, reading line 42%, upcoming line on, mirror and flip off, 150 words/min). It doesn't touch your scripts or speaker colors.
- **Fullscreen:** a button in the presenter's top bar, or press `F`. It's hidden in browsers without the Fullscreen API (iPhone Safari), and leaving the presenter also leaves fullscreen.
- **Clickers and keyboards:** a Bluetooth clicker or page turner works as long as it sends keyboard keys. Next: Space, Enter, →, ↓, Page Down, Media Next. Back: ←, ↑, Page Up, Backspace, Media Previous. Home restarts, Esc exits.

## Editing

`index.html` carries a copy of `app.html` inside a `__bundler/template` script (a JSON string, with camelCase attributes such as `onClick` and `onChange` written as `sc-camel-on-click` and `sc-camel-on-change`). A change to the app markup or script has to be made in both places, and the template must still parse as JSON afterwards. Styling changes go in `teleprompter.css` and need no bundle edit.

Style rules live in the repo's `STYLEGUIDE.md`.
