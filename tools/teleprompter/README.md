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

## Editing

`index.html` carries a copy of `app.html` inside a `__bundler/template` script (a JSON string, with camelCase attributes such as `onClick` and `onChange` written as `sc-camel-on-click` and `sc-camel-on-change`). A change to the app markup or script has to be made in both places, and the template must still parse as JSON afterwards. Styling changes go in `teleprompter.css` and need no bundle edit.

Style rules live in the repo's `STYLEGUIDE.md`.
