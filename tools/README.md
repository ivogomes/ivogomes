# Tools

Each tool lives in its own repo and is served from its folder here on ivogomes.com. This repo keeps
only the Tools page (`index.html`).

| Folder | Repo | Served at |
| --- | --- | --- |
| `finance/` | [ivogomes/fin](https://github.com/ivogomes/fin) | `/tools/finance/` |
| `tapscore/` | [ivogomes/tapscore](https://github.com/ivogomes/tapscore) (the web app at its root; the phone, Apple Watch and Wear OS apps in `app/`, `watch/` and `wear/`, which aren't published) | `/tools/tapscore/` |
| `teleprompter/` | [ivogomes/teleprompter](https://github.com/ivogomes/teleprompter) | `/tools/teleprompter/` |
| `tmx-editor/` | [ivogomes/tmx-editor](https://github.com/ivogomes/tmx-editor) | `/tools/tmx-editor/` |

**Deploying.** The site's deploy (`.github/workflows/deploy.yml`) checks each repo out into its
folder before publishing. A push to a tool's repo starts that deploy through its
`.github/workflows/deploy-site.yml`, which needs a `SITE_DEPLOY_TOKEN` secret in the tool's repo: a
fine-grained token with **Contents: read and write** on `ivogomes/ivogomes` (that's what
`repository_dispatch` asks for). Without it, the tool's changes go live with the site's next deploy,
or **Run workflow** on the site's Deploy action.

**Working on a tool with the site.** Clone its repo into its folder (the folders are in this repo's
`.gitignore`), then `npm run preview` serves everything at http://localhost:4000 as before:

```sh
git clone https://github.com/ivogomes/fin tools/finance
git clone https://github.com/ivogomes/tapscore tools/tapscore
git clone https://github.com/ivogomes/teleprompter tools/teleprompter
git clone https://github.com/ivogomes/tmx-editor tools/tmx-editor
```

Each tool also runs on its own, from any address: its styles are copied into its `shared/` folder
(from `src/tokens.css`, `src/tools.css` and `src/tools-look.css`; see `STYLEGUIDE.md`).
