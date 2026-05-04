# AGENTS.md - muesli-public

## Mission

Muesli is an Electron desktop meeting assistant built from Recall AI's public desktop SDK example. Good work preserves recording and transcription behavior while moving the app toward a polished meeting-first workspace for transcript capture, agenda tracking, markdown notes, tasks, search, and sharing.

## First-Turn Workflow

1. Inspect repo structure and current git state before assuming ownership or file status.
2. Read this file, `README.md`, `package.json`, and the relevant source-of-truth files for the area being changed.
3. Prefer current repo reality over stale plans, screenshots, or model memory.
4. For UI work, inspect `.design-package/` before editing implementation files.
5. Make the smallest coherent change that satisfies the task while preserving Recall AI recording/transcription IPC paths.
6. Verify with the narrowest meaningful gate, then report done, partial, or blocked explicitly.

## Source of Truth

- `HANDBOOK.md`: Delano delivery model, contracts, status rules, sync discipline, quality gates, and evidence requirements.
- `.project/`: delivery state and project memory; treat this as the canonical source for active scope, progress, and evidence.
- `.project/projects/<slug>/`: active delivery contracts: `spec.md`, `plan.md`, `decisions.md`, `workstreams/`, `tasks/`, and `updates/`.
- `.project/context/`: current project memory; start with its `README.md` when present, then read only the files relevant to the task.
- `.agents/`: canonical shared Delano runtime, including skills, scripts, rules, hooks, schemas, and validation fixtures.
- `.claude/`: optional compatibility mirror of `.agents/`; when absent or divergent, `.agents/` remains canonical.
- `README.md`: setup, runtime notes, Recall transcription provider configuration, and known operational details.
- `package.json`: Electron Forge scripts, app dependencies, and available npm gates.
- `src/`: implemented Electron, server, Recall SDK, transcription, UI, and IPC behavior.
- `.design-package/`: visual and component reference from Bart; use as guidance, not as a separate app to ship blindly.

## Retrieval Index

- Delano process or status questions -> `HANDBOOK.md` and the matching `.agents/skills/<step>-skill/SKILL.md`.
- Active scope, acceptance, or evidence -> `.project/projects/<slug>/spec.md`, `plan.md`, `tasks/`, and `updates/`.
- Project memory or handoff context -> `.project/context/`.
- Runtime validation and coordination -> `.agents/scripts/pm/validate.sh`, `status.sh`, `next.sh`, `blocked.sh`, plus `npx delano validate`.
- UI redesign or component decisions -> `.design-package/app.jsx`, `sidebar.jsx`, `rail.jsx`, `styles.css`, and `.design-package/uploads/ChatGPT Image May 1, 2026, 04_30_08 PM.png`.
- Electron/Recall behavior -> `src/`, `README.md`, and existing IPC/server paths before changing recording or transcription flows.
- Stack and commands -> `package.json`, `README.md`, and relevant webpack/Electron Forge config.
- Secrets and local configuration -> `.env` exists locally; never print or commit secret values.

## Delano Order of Operations

Use the full Delano flow for features, contract changes, cross-file delivery work, or material product improvements:

1. Discovery - define the measurable outcome and planned `spec.md` with `discovery-skill`.
2. Prototype Probe - run a time-boxed probe only when uncertainty is material; fold findings back into the spec with `prototype-skill`.
3. Planning - translate the active spec into architecture, rollout, rollback, and workstreams in `plan.md` with `planning-skill`.
4. Breakdown - create atomic tasks with binary acceptance criteria, dependencies, and conflict zones with `breakdown-skill`.
5. Synchronization - reconcile local contracts with Linear/GitHub when tracker state is involved with `sync-skill`.
6. Execution - complete dependency-safe tasks inside workstream boundaries and record evidence in `updates/` with `execution-skill`.
7. Quality Ops - run risk-based checks and verify acceptance before closure with `quality-skill`.
8. Closeout - compare delivery to the outcome, update project memory, and close the loop with `closeout-skill`; use `learning-skill` when reusable decisions or process lessons should be captured.

For small local fixes, follow the first-turn workflow and update Delano artifacts only when scope, architecture, status, or evidence changes.

## Product Direction

Current target: transform the existing Recall AI desktop recorder into a calm, focused, modern three-column Meeting Notes workspace aligned with Bart's design package (`./design-package/`) and product spec.

Core UX principles:

- meeting-first, not generic chatbot-first
- recording state must always be obvious
- transcript, agenda, notes, and tasks must stay connected to the current meeting
- private timestamped notes/comments must not be shared unless explicitly enabled
- keep the interface uncluttered and suitable for active meeting use

MVP scope:

- create a new meeting
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

## Engineering Constraints

- This is an Electron app using Electron Forge and webpack.
- Keep the existing Recall AI desktop SDK integration working.
- Do not remove or bypass existing recording/transcription IPC paths unless replacing them with a verified equivalent.
- Prefer incremental changes that keep `npm run start:server`, `npm run start:electron`, `npm start`, and `npm run package` viable.
- `npm run lint` currently prints that linting is not configured; use targeted syntax/build checks when that is more meaningful.
- Keep generated/copied design assets small and intentional, and document why they are included.

## Safety

- Do not commit `.env`, local recordings, generated logs, `node_modules`, or secrets.
- Do not print secret values from `.env` or runtime configuration.
- Do not use destructive git or filesystem operations without explicit approval.
- Preserve user changes already present in the worktree; work with them instead of reverting them.
- Confirm before outbound public actions such as publishing, deploying, or mutating remote tracker state.

## Verification

- Run the smallest useful gate before claiming success:
  - `npx delano validate` before/after major Delano or delivery-state work.
  - `npx delano status` and `npx delano next -- --all` when resuming or coordinating larger work.
  - `npm run lint` if relevant, knowing it is currently a placeholder.
  - `npm run package` for build verification when feasible.
  - targeted `node --check` or equivalent syntax checks for changed JavaScript files.
- Report what changed, what was verified, and what remains incomplete or blocked.
