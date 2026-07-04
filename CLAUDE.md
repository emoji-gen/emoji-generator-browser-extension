# CLAUDE.md

## Overview

A browser extension for [Emoji Generator](https://emoji-gen.ninja) that enables users to register custom emojis to Slack directly from the web app.

### Key Features

1. Fetch a list of Slack teams the user has joined
2. Register a generated emoji to a selected Slack team
3. Open emoji-gen.ninja via the toolbar button

Features 1 and 2 require cross-site access to `https://*.slack.com/*`, which browsers block from web pages. The extension bridges this gap through its background service worker and `host_permissions`.

### Supported Browsers

- Google Chrome (Manifest V3)
- Firefox (Manifest V3)

## Architecture

- `src/content_scripts/` — Injected into emoji-gen.ninja. Receives requests from the page and forwards them to the background service worker via Chrome messaging.
- `src/background/` — Handles Slack API communication. `slack.ts` implements team search and emoji registration.
- `src/event.ts` — Message type constants shared between content scripts and background.
- `src/manifest.json` — Mustache template. Processed by `manifestPlugin` in `rsbuild.config.ts` to inject the version and `isDev` flag at build time.
- `_DEBUG` — Global boolean injected via `source.define`; `true` in watch/test, `false` in production.
- Test files are co-located with source files (`*.test.ts`). The test environment is happy-dom.

## Commands

| Purpose      | Command              |
| ------------ | -------------------- |
| Build        | `npm run build`      |
| Watch        | `npm start`          |
| All tests    | `npm test`           |
| Unit tests   | `npm run test:unit`  |
| Type check   | `npm run test:types` |
| Format check | `npm run format`     |
| Format fix   | `npm run format:fix` |

`npm test` runs format check, unit tests, and type check in sequence.

## Configuration Files

| File                | Purpose                                                         |
| ------------------- | --------------------------------------------------------------- |
| `rsbuild.config.ts` | Entry points, output paths, manifest generation, zip generation |
| `rstest.config.ts`  | Test configuration (environment, globals)                       |
| `tsconfig.json`     | TypeScript configuration                                        |

## Conventions

- Write commit messages, PR descriptions, and documentation in English
- Run `npm run build` and `npm test` before committing; if `npm test` fails on formatting, run `npm run format:fix`

## Related Repositories

- [emoji-gen/web-main](https://github.com/emoji-gen/web-main) — The Emoji Generator web application
