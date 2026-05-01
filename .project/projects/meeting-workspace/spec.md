---
name: Meeting Notes Active Meeting Workspace
slug: meeting-workspace
owner: Bart
status: active
created: 2026-05-01T16:38:11Z
updated: 2026-05-01T16:40:00Z
outcome: Transform the Recall AI desktop recorder into a polished active meeting workspace matching the supplied design package while preserving Recall recording/transcription integration.
uncertainty: medium
probe_required: false
probe_status: skipped
---

# Spec: Meeting Notes Active Meeting Workspace

## Executive Summary

Build a desktop meeting assistant that helps users record meetings, generate live speaker-separated transcripts, keep structured notes, track agenda items, capture follow-up tasks, search/reopen meetings, and share a clean meeting record.

The main screen is the Active Meeting Workspace: three-column desktop layout with navigation/meeting history on the left, live meeting transcript/recording controls in the center, and agenda + notes editor on the right.

## Product purpose

After a meeting, the user should not only have a recording. They should have:
- searchable transcript
- separated speakers
- timestamps
- structured notes
- key decisions
- action items
- shareable meeting record

The app should allow users to stay present in the meeting while the system captures and structures the content.

## Primary screen

### Left sidebar
- app icon + `Meeting Notes`
- `New meeting` button with `⌘ N`
- navigation: Home, Search (`⌘ K`), Inbox with optional badge
- meeting history grouped by Today, This week, Last week, older
- each meeting item shows title, time/date, duration, selected state
- secondary nav: Templates, Settings
- user profile with avatar, name, email, dropdown affordance

### Main content
- meeting title: `Product Hunt Launch Meeting` style, editable/dropdown affordance
- tabs: Summary, Transcript, Notes, Tasks. Transcript active by default.
- top-right collaboration controls: Share, participant avatars, +N, overflow menu
- recording status card near transcript top:
  - red recording dot
  - label Recording
  - waveform/activity indicator
  - elapsed time
  - Pause and Stop buttons
- transcript entries with timestamp, speaker initials/avatar, speaker name, text
- contextual input at bottom should be a private meeting note input, not generic chat:
  - placeholder `Add a private meeting note...`
  - saves with current timestamp
  - visually distinct from official transcript

### Right panel
- agenda panel with status indicator, agenda title, planned time, Edit button
- statuses: not started, active, completed
- notes panel with Notes/Preview tabs
- markdown editor with headings, bullets, numbered lists, checkboxes, links, images, code blocks, preview mode, expand/fullscreen affordance
- default note template:
  - `# Meeting Title`
  - `## Goals`
  - `## Key Takeaways`
  - `## Action Items`
- autosave state: `Saved just now`, `Saving...`, etc.

## Recording states

Support UI states:
- Idle: Start recording
- Recording: Pause, Stop
- Paused: Resume, Stop
- Stopped: Process transcript / Generate summary / Export/share
- Processing: progress; prevent destructive changes where needed

Preserve existing Recall AI desktop SDK recording/transcription integration. Do not replace real recording paths with fake-only UI.

## Summary tab

Editable post-meeting overview with:
- meeting overview
- key decisions
- risks
- open questions
- action items
- follow-up recommendations

## Tasks tab

Collect follow-up work from:
- manually created tasks
- markdown checkboxes
- extracted transcript action items
- private timestamped notes marked as tasks

MVP task fields: title, owner, due date, status, source reference.

## Search and sharing

Search across meeting title, transcript, speaker names, notes, action items, agenda.

Share should expose options for transcript, notes, summary, tasks, agenda. Private comments must be excluded by default and only included if explicitly enabled.

## Acceptance criteria

- user can start meeting recording in one click
- transcript appears live with timestamps and speakers using existing Recall flow
- user can pause and stop recording where supported by existing backend, or clear MVP UI hooks exist without breaking stop
- user can write structured notes during meeting
- notes autosave reliably
- agenda items are visible and editable or have an obvious edit affordance
- action items can be captured in notes / tasks UI
- completed meetings remain available in sidebar
- meeting can be searched and reopened later
- meeting record has a share control/modal
- private notes/comments are not accidentally exposed in shared views

## Design reference

Use `.design-package/` as visual reference. Important files:
- `.design-package/app.jsx`
- `.design-package/sidebar.jsx`
- `.design-package/rail.jsx`
- `.design-package/styles.css`
- `.design-package/uploads/ChatGPT Image May 1, 2026, 04_30_08 PM.png`

Adapt, do not blindly replace, because this repo is Electron + Recall AI SDK rather than a standalone design prototype.
