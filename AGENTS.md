# AGENTS.md - muesli-public

## Project purpose

This repository is the Muesli desktop meeting assistant, based on Recall AI's public desktop SDK example. The app should become an active meeting workspace for recording meetings, live speaker-separated transcript capture, agenda tracking, markdown notes, tasks, search, and sharing.

## Product direction

Current target: transform the existing Recall AI desktop recorder into a polished three-column Meeting Notes workspace aligned with the design package in `.design-package/` and the product spec from Bart.

Core UX principles:
- calm, focused, modern, uncluttered
- meeting-first, not generic chatbot-first
- recording state must always be obvious
- transcript, agenda, notes, and tasks must stay connected to the current meeting
- private timestamped notes/comments must not be shared unless explicitly enabled

## Existing framework constraints

- This is an Electron app using Electron Forge + webpack.
- Keep the existing Recall AI desktop SDK integration working.
- Do not remove or bypass existing recording/transcription IPC paths unless replacing them with a verified equivalent.
- `.env` exists locally and may contain secrets. Never commit it or print secret values.
- Prefer incremental changes that keep `npm run start:server`, `npm run start:electron`, and `npm run package` viable.

## Design package

Bart provided the design package at:

- Windows: `C:\MegaSync\meeting-app-design.zip`
- Extracted repo copy: `.design-package/`

Use it as visual and component reference, not as a separate app to ship blindly. The final implementation must fit this repo's Electron/Recall architecture.

Important design files:
- `.design-package/app.jsx`
- `.design-package/sidebar.jsx`
- `.design-package/rail.jsx`
- `.design-package/styles.css`
- `.design-package/uploads/ChatGPT Image May 1, 2026, 04_30_08 PM.png`

## Delano

This repository uses Delano.

Canonical process and contracts live in `HANDBOOK.md`.
Delivery state lives in `.project/`.
Shared runtime lives in `.agents/`.
`.claude/` may exist as a compatibility mirror of `.agents/`; when absent, `.agents/` remains canonical.

When working in this repository:
- treat `.project/` as the source of truth for delivery state
- use the Delano status model and evidence discipline from `HANDBOOK.md`
- keep sync and quality gates aligned with the handbook
- use `npx delano validate` before/after major work to verify the runtime
- use `npx delano status` and `npx delano next -- --all` when resuming or coordinating larger work
- use `npx delano init <slug> "<Project Name>" [owner] [lead]` to scaffold a new delivery project when needed

## Workflow for coding agents

1. Read this file, `README.md`, `package.json`, and relevant source files before editing.
2. Inspect `.design-package/` when doing UI work.
3. Preserve Recall AI recording/transcription behavior while redesigning the interface.
4. Keep changes small enough to verify.
5. Run the smallest useful gate before claiming success:
   - `npm run lint` if relevant
   - `npm run package` for build verification when feasible
   - targeted `node --check` / syntax checks for changed JS files
6. Report what was changed, what was verified, and what remains incomplete.

## Current product spec summary

The MVP should include:
- create new meeting
- record, pause, and stop meeting recording
- live speaker-separated transcript with timestamps
- meeting notes editor with autosave state
- agenda panel with manual edit affordance
- meeting history grouped by date
- search entry point
- manual action items through markdown checkboxes/tasks
- basic sharing controls

Out of MVP:
- automatic agenda progression
- complex task management
- deep calendar integration
- multi-workspace permissions
- advanced analytics
- automatic CRM/project-management sync
- autonomous sharing of private comments

## Repo hygiene

- Do not commit `.env`, local recordings, generated logs, or secrets.
- Do not commit `node_modules`.
- Keep design assets small and intentional.
- If adding generated or copied design files, document why.
