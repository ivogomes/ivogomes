# TMX Editor

A browser-based editor for TMX (Translation Memory eXchange) files. Open a file, review and fix its segments in a table, and export the result. It runs entirely in the browser. The file is read and written locally and is never uploaded. Served at `/tools/tmx-editor/`.

| File | What it is |
| --- | --- |
| `index.html` | Page shell: header, empty state, table, and the dialogs and side panel. |
| `app.js` | All the app logic. Plain JavaScript, no build step and no dependencies. |
| `styles.css` | The tool's styles, built on the site tokens (`/src/tokens.css`, `/src/tools.css`). |

## Run it

The page loads `/src/tokens.css` and `/src/tools.css` from the site root, so serve the repo root rather than opening the file directly:

```bash
npm run preview        # from the repo root, serves at http://localhost:4000
# then open http://localhost:4000/tools/tmx-editor/
```

## Using it

- **Open or create:** "Open TMX" accepts `.tmx` and `.xml` files, or you can create a new empty file.
- **Table:** each translation unit (TU) is a row, with one column per language. Rows are paged 200 at a time.
- **Edit in place:** click a cell to edit it. An empty cell adds the missing translation, and a new `<tuv>` is created on export. Edited cells are highlighted.
- **Default and Compare:** "Default" is the source language. "Compare" shows a single target next to it, instead of every language.
- **Languages…:** add a language, rename a code, or remove a language and all its translations.
- **File…:** edit the TMX header attributes, notes and properties.
- **TU panel:** open a row to edit its notes, properties and attributes, and the per-language details.
- **Search and Replace:** search across the file, then replace in only the languages you choose. You can match case, and a live match count shows before you commit.
- **Filters:** the status bar offers chips for modified rows, rows missing a translation, and placeholder issues. Placeholder issues are rows where tokens such as `%s`, `{0}` or `${var}` differ between languages.
- **Merge duplicates:** combines TUs that share the same source text. A group whose translations conflict for a language is left alone.
- **Bulk delete:** tick rows, then delete them.
- **Undo and redo:** the arrow buttons, or <kbd>⌘Z</kbd> / <kbd>⇧⌘Z</kbd> (Ctrl on Windows and Linux). <kbd>Ctrl</kbd>+<kbd>Y</kbd> also redoes. The shortcuts are ignored while you're typing in a field.
- **Export TMX:** downloads the edited file. The browser warns before you leave the page with unsaved changes.

## Notes

- Language codes are read from `xml:lang` (or `lang`) on each `<tuv>`, and shown with their English names via `Intl.DisplayNames`.
- A new file starts with a header of `srclang="en"`, `datatype="PlainText"`, `segtype="block"`, and `creationtool="TMX Editor"`.
- The file is parsed with the browser's `DOMParser` and written back with `XMLSerializer`.
- The page loads Google Analytics and Google Fonts (Inter, JetBrains Mono), like the rest of the site.

Style rules live in the repo's `STYLEGUIDE.md`.
