import './index.css';
import { marked } from 'marked';

const DEFAULT_NOTE_TEMPLATE = (title, date = new Date()) => `# ${title}

## Goals
- [ ] 

## Key Takeaways
- 

## Action Items
- [ ] 

`;

const DEFAULT_AGENDA = [
  { id: 'agenda-1', text: 'Launch strategy overview', time: '10:00 AM', status: 'active' },
  { id: 'agenda-2', text: 'Product messaging & positioning', time: '10:15 AM', status: 'not-started' },
  { id: 'agenda-3', text: 'Demo & feature highlights', time: '10:35 AM', status: 'not-started' },
  { id: 'agenda-4', text: 'Go-to-market plan', time: '10:55 AM', status: 'not-started' },
  { id: 'agenda-5', text: 'Launch timeline & next steps', time: '11:15 AM', status: 'not-started' },
];

const state = {
  meetingsData: { upcomingMeetings: [], pastMeetings: [] },
  currentMeetingId: null,
  activeTab: 'transcript',
  notesTab: 'edit',
  agendaEditMode: false,
  isRecording: false,
  recordingState: 'idle',
  currentRecordingId: null,
  recordingStartedAt: null,
  accumulatedRecordingMs: 0,
  timerId: null,
  saveTimer: null,
  saveStateTimer: null,
  meetingDetected: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function getAllMeetings() {
  return [...state.meetingsData.upcomingMeetings, ...state.meetingsData.pastMeetings]
    .filter(meeting => meeting.type !== 'calendar')
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function getCurrentMeeting() {
  return getAllMeetings().find(meeting => meeting.id === state.currentMeetingId) || null;
}

function ensureMeetingShape(meeting) {
  if (!meeting.content) {
    meeting.content = DEFAULT_NOTE_TEMPLATE(meeting.title || 'Meeting Notes', new Date(meeting.date || Date.now()));
  }
  if (!Array.isArray(meeting.transcript)) meeting.transcript = [];
  if (!Array.isArray(meeting.participants)) meeting.participants = [];
  if (!Array.isArray(meeting.privateNotes)) meeting.privateNotes = [];
  if (!Array.isArray(meeting.agenda)) meeting.agenda = DEFAULT_AGENDA.map(item => ({ ...item }));
  if (!meeting.summary) meeting.summary = '';
  return meeting;
}

function formatDateGroup(dateString) {
  const date = new Date(dateString || Date.now());
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date > weekAgo) return 'This week';
  if (date > twoWeeksAgo) return 'Last week';
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

function formatSidebarTime(meeting) {
  const date = new Date(meeting.date || Date.now());
  const today = new Date().toDateString() === date.toDateString();
  return today
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTranscriptTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function initials(name = 'Unknown') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function speakerColorIndex(name = '') {
  let total = 0;
  for (const char of name) total += char.charCodeAt(0);
  return (total % 4) + 1;
}

function textFromHtmlUnsafe(md) {
  return marked.parse(md || '', { mangle: false, headerIds: false });
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2600);
}

function setSaveState(label, saving = false) {
  const status = $('#saveStatus');
  const text = $('#saveStatusText');
  if (!status || !text) return;
  status.classList.toggle('saving', saving);
  text.textContent = label;
}

async function saveMeetingsData() {
  localStorage.setItem('meetingsData', JSON.stringify(state.meetingsData));
  const result = await window.electronAPI.saveMeetingsData(state.meetingsData);
  if (!result.success) throw new Error(result.error || 'Could not save meeting data');
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  clearTimeout(state.saveStateTimer);
  setSaveState('Saving...', true);
  state.saveTimer = setTimeout(async () => {
    try {
      await saveCurrentMeeting();
      setSaveState('Saved just now', false);
    } catch (error) {
      console.error('Autosave failed:', error);
      setSaveState('Save failed', false);
    }
  }, 700);
}

async function saveCurrentMeeting() {
  const meeting = getCurrentMeeting();
  if (!meeting) return;

  const title = ($('#noteTitle')?.textContent || '').trim() || 'Untitled meeting';
  const notes = $('#simple-editor')?.value || '';
  const summary = $('#summaryEditor')?.value || '';

  meeting.title = title;
  meeting.content = notes;
  meeting.summary = summary;

  const syncMeeting = (list) => {
    const index = list.findIndex(item => item.id === meeting.id);
    if (index !== -1) list[index] = meeting;
  };
  syncMeeting(state.meetingsData.pastMeetings);
  syncMeeting(state.meetingsData.upcomingMeetings);
  await saveMeetingsData();
  renderSidebar();
}

async function loadMeetingsDataFromFile() {
  try {
    const result = await window.electronAPI.loadMeetingsData();
    if (result.success) {
      state.meetingsData = {
        upcomingMeetings: result.data.upcomingMeetings || [],
        pastMeetings: result.data.pastMeetings || [],
      };
      getAllMeetings().forEach(ensureMeetingShape);
    } else {
      console.error('Failed to load meetings:', result.error);
    }
  } catch (error) {
    console.error('Error loading meetings:', error);
    const cached = localStorage.getItem('meetingsData');
    if (cached) state.meetingsData = JSON.parse(cached);
  }
}

function renderSidebar() {
  const history = $('#meetingHistory');
  if (!history) return;
  const groups = {};
  getAllMeetings().forEach(meeting => {
    const group = formatDateGroup(meeting.date);
    if (!groups[group]) groups[group] = [];
    groups[group].push(meeting);
  });

  history.replaceChildren();
  if (Object.keys(groups).length === 0) {
    const empty = document.createElement('div');
    empty.className = 'transcript-empty';
    empty.textContent = 'No meetings yet';
    history.appendChild(empty);
    return;
  }

  Object.entries(groups).forEach(([label, meetings]) => {
    const group = document.createElement('div');
    group.className = 'sb-date-group';
    const heading = document.createElement('div');
    heading.className = 'sb-date-label';
    heading.textContent = label;
    group.appendChild(heading);

    meetings.forEach(meeting => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `meeting-item ${meeting.id === state.currentMeetingId ? 'active' : ''}`;
      button.dataset.meetingId = meeting.id;

      const title = document.createElement('div');
      title.className = 'mi-title';
      if (meeting.id === state.currentMeetingId && state.isRecording) {
        const dot = document.createElement('span');
        dot.className = 'mi-dot';
        title.appendChild(dot);
      }
      title.append(meeting.title || 'Untitled meeting');

      const time = document.createElement('div');
      time.className = 'mi-time';
      time.textContent = formatSidebarTime(meeting);

      const duration = document.createElement('div');
      duration.className = 'mi-dur';
      duration.textContent = meeting.duration || (meeting.transcript?.length ? `${meeting.transcript.length} lines` : '0m');

      button.append(title, time, duration);
      button.addEventListener('click', async () => {
        await saveCurrentMeeting();
        selectMeeting(meeting.id);
      });
      group.appendChild(button);
    });

    history.appendChild(group);
  });
}

function renderParticipantAvatars(meeting) {
  const stack = $('#participantAvatars');
  if (!stack) return;
  const participants = (meeting?.participants || []).slice(0, 3);
  stack.replaceChildren();
  if (participants.length === 0) {
    ['BM', 'ME'].forEach((label, index) => {
      const avatar = document.createElement('div');
      avatar.className = `avatar sp-${index + 1}`;
      avatar.textContent = label;
      stack.appendChild(avatar);
    });
    return;
  }
  participants.forEach((participant) => {
    const avatar = document.createElement('div');
    avatar.className = `avatar sp-${speakerColorIndex(participant.name)}`;
    avatar.title = participant.name || 'Participant';
    avatar.textContent = initials(participant.name);
    stack.appendChild(avatar);
  });
  if ((meeting.participants || []).length > 3) {
    const more = document.createElement('div');
    more.className = 'more';
    more.textContent = `+${meeting.participants.length - 3}`;
    stack.appendChild(more);
  }
}

function renderTranscript(meeting) {
  const content = $('#meetingTranscriptContent');
  const count = $('#transcriptCount');
  if (!content) return;
  const entries = meeting?.transcript || [];
  const privateNotes = meeting?.privateNotes || [];
  const mixed = [
    ...entries.map((entry, index) => ({ ...entry, kind: 'speech', sort: new Date(entry.timestamp || 0).getTime() || index })),
    ...privateNotes.map((entry, index) => ({ ...entry, kind: 'private', sort: new Date(entry.timestamp || 0).getTime() || Date.now() + index })),
  ].sort((a, b) => a.sort - b.sort);

  if (count) count.textContent = String(entries.length);
  const wasAtBottom = content.scrollTop + content.clientHeight >= content.scrollHeight - 8;
  content.replaceChildren();

  if (!meeting) {
    const empty = document.createElement('div');
    empty.className = 'transcript-empty';
    empty.textContent = 'Create or select a meeting to start recording and taking notes.';
    content.appendChild(empty);
    return;
  }

  if (mixed.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'transcript-empty';
    empty.textContent = 'Live transcript will appear here during recording.';
    content.appendChild(empty);
    return;
  }

  mixed.forEach((entry, index) => {
    if (entry.kind === 'private') {
      const row = document.createElement('div');
      row.className = 't-comment';
      const time = document.createElement('div');
      time.className = 't-time';
      time.textContent = formatTranscriptTime(entry.timestamp);
      const body = document.createElement('div');
      body.className = 't-comment-body';
      const label = document.createElement('div');
      label.className = 't-comment-label';
      label.textContent = 'Private note';
      const text = document.createElement('div');
      text.textContent = entry.text || '';
      body.append(label, text);
      row.append(time, body);
      content.appendChild(row);
      return;
    }

    const speaker = entry.speaker || 'Unknown Speaker';
    const color = speakerColorIndex(speaker);
    const row = document.createElement('div');
    row.className = `t-entry ${index === mixed.length - 1 ? 'newest-entry' : ''}`;

    const time = document.createElement('div');
    time.className = 't-time';
    time.textContent = formatTranscriptTime(entry.timestamp);

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 't-avatar';
    const avatar = document.createElement('div');
    avatar.className = `avatar sp-${color}`;
    avatar.textContent = initials(speaker);
    avatarWrap.appendChild(avatar);

    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = `t-speaker s${color}`;
    name.textContent = speaker;
    const text = document.createElement('div');
    text.className = 't-text';
    text.textContent = entry.text || '';
    body.append(name, text);

    row.append(time, avatarWrap, body);
    content.appendChild(row);
  });

  if (wasAtBottom || mixed.length < 3) {
    requestAnimationFrame(() => {
      content.scrollTop = content.scrollHeight;
    });
  }
}

function renderAgenda(meeting) {
  const list = $('#agendaList');
  if (!list) return;
  list.replaceChildren();

  const agenda = meeting?.agenda || DEFAULT_AGENDA;
  agenda.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `agenda-item ${item.status || 'not-started'}`;
    const status = document.createElement('button');
    status.type = 'button';
    status.className = `agenda-status ${item.status || 'not-started'}`;
    status.ariaLabel = 'Cycle agenda status';
    status.addEventListener('click', () => {
      item.status = item.status === 'not-started' ? 'active' : item.status === 'active' ? 'completed' : 'not-started';
      scheduleSave();
      renderAgenda(meeting);
    });

    const label = state.agendaEditMode ? document.createElement('input') : document.createElement('div');
    label.className = state.agendaEditMode ? 'agenda-input' : 'agenda-label';
    label.value = item.text || '';
    label.textContent = item.text || '';
    if (state.agendaEditMode) {
      label.addEventListener('input', () => {
        item.text = label.value;
        scheduleSave();
      });
    }

    const time = state.agendaEditMode ? document.createElement('input') : document.createElement('div');
    time.className = state.agendaEditMode ? 'agenda-input agenda-time' : 'agenda-time';
    time.value = item.time || '';
    time.textContent = item.time || '';
    if (state.agendaEditMode) {
      time.addEventListener('input', () => {
        item.time = time.value;
        scheduleSave();
      });
    }

    row.append(status, label, time);
    list.appendChild(row);

    if (state.agendaEditMode && index === agenda.length - 1) {
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'agenda-item';
      add.textContent = '+ Add agenda item';
      add.addEventListener('click', () => {
        agenda.push({ id: `agenda-${Date.now()}`, text: 'New agenda item', time: '', status: 'not-started' });
        scheduleSave();
        renderAgenda(meeting);
      });
      list.appendChild(add);
    }
  });
}

function getTaskLines(markdown = '') {
  return markdown
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter(item => /^\s*[-*]\s+\[[ xX]\]\s+/.test(item.line))
    .map(item => ({
      text: item.line.replace(/^\s*[-*]\s+\[[ xX]\]\s+/, '').trim() || 'Untitled task',
      done: /\[[xX]\]/.test(item.line),
      source: `Notes line ${item.index + 1}`,
    }));
}

function renderTasks(meeting) {
  const taskCount = $('#taskCount');
  const tasksView = $('#tasksView');
  const tasks = getTaskLines(meeting?.content || '');
  if (taskCount) taskCount.textContent = String(tasks.filter(task => !task.done).length);
  if (!tasksView) return;
  tasksView.replaceChildren();
  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'transcript-empty';
    empty.textContent = 'Add markdown checkboxes in notes to capture action items.';
    tasksView.appendChild(empty);
    return;
  }
  tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'task-row';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = task.done;
    box.disabled = true;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = task.text;
    const source = document.createElement('div');
    source.className = 'mi-time';
    source.textContent = task.source;
    body.append(title, source);
    row.append(box, body);
    tasksView.appendChild(row);
  });
}

function renderNotesPreview() {
  const editor = $('#simple-editor');
  const preview = $('#notesPreview');
  if (!editor || !preview) return;
  preview.innerHTML = textFromHtmlUnsafe(editor.value);
}

function renderRecordingState() {
  const card = $('#recordingCard');
  const status = $('#recordingStatus');
  const statusText = $('#recordingStatusText');
  const waveform = $('#waveform');
  const recordButton = $('#recordButton');
  const pauseButton = $('#pauseButton');
  const stopButton = $('#stopButton');
  const isActive = state.recordingState === 'recording' || state.recordingState === 'paused';

  card?.classList.toggle('recording', isActive);
  status.className = `rec-status ${state.recordingState}`;
  waveform.className = `waveform ${state.recordingState}`;
  statusText.textContent = state.recordingState === 'recording'
    ? 'Recording'
    : state.recordingState === 'paused'
      ? 'Paused'
      : 'Idle';

  recordButton.disabled = false;
  recordButton.querySelector('.record-label').textContent = isActive ? '' : 'Start recording';
  pauseButton.disabled = !isActive;
  stopButton.disabled = !isActive;
  pauseButton.ariaLabel = state.recordingState === 'paused' ? 'Resume recording' : 'Pause recording';
  pauseButton.querySelector('.pause-icon').textContent = state.recordingState === 'paused' ? '▶' : 'Ⅱ';
  state.isRecording = isActive;
  renderSidebar();
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    const runningMs = state.recordingState === 'recording' && state.recordingStartedAt
      ? Date.now() - state.recordingStartedAt
      : 0;
    $('#elapsedTimer').textContent = formatElapsed(state.accumulatedRecordingMs + runningMs);
  }, 500);
}

async function checkActiveRecordingState() {
  const meeting = getCurrentMeeting();
  if (!meeting) return;
  try {
    const result = await window.electronAPI.getActiveRecordingId(meeting.id);
    if (result.success && result.data) {
      state.currentRecordingId = result.data.recordingId;
      state.recordingState = result.data.state === 'paused' ? 'paused' : 'recording';
      state.recordingStartedAt = result.data.startTime ? new Date(result.data.startTime).getTime() : Date.now();
      state.accumulatedRecordingMs = 0;
    } else {
      state.currentRecordingId = null;
      state.recordingState = 'idle';
      state.recordingStartedAt = null;
      state.accumulatedRecordingMs = 0;
    }
    renderRecordingState();
  } catch (error) {
    console.error('Error checking recording state:', error);
  }
}

function renderActiveMeeting() {
  const meeting = getCurrentMeeting();
  if (meeting) ensureMeetingShape(meeting);

  $('#noteTitle').textContent = meeting?.title || 'New meeting';
  $('#simple-editor').value = meeting?.content || DEFAULT_NOTE_TEMPLATE('New meeting');
  $('#summaryEditor').value = meeting?.summary || '';
  $('#notesFocusEditor').value = meeting?.content || '';
  $('#privateNoteTime').textContent = formatTranscriptTime(new Date().toISOString());

  renderParticipantAvatars(meeting);
  renderTranscript(meeting);
  renderAgenda(meeting);
  renderTasks(meeting);
  renderNotesPreview();
  checkActiveRecordingState();
}

function selectMeeting(meetingId) {
  state.currentMeetingId = meetingId;
  renderSidebar();
  renderActiveMeeting();
}

async function createNewMeeting({ autoStart = true } = {}) {
  await saveCurrentMeeting();
  const now = new Date();
  const id = `meeting-${Date.now()}`;
  const title = 'New meeting';
  const meeting = ensureMeetingShape({
    id,
    type: 'document',
    title,
    subtitle: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hasDemo: false,
    date: now.toISOString(),
    participants: [],
    transcript: [],
    privateNotes: [],
    agenda: DEFAULT_AGENDA.map(item => ({ ...item })),
    content: DEFAULT_NOTE_TEMPLATE(title, now),
  });

  state.meetingsData.pastMeetings.unshift(meeting);
  state.currentMeetingId = id;
  await saveMeetingsData();
  renderSidebar();
  renderActiveMeeting();
  if (autoStart) await startRecording();
  return id;
}

async function startRecording() {
  let meeting = getCurrentMeeting();
  if (!meeting) {
    await createNewMeeting({ autoStart: false });
    meeting = getCurrentMeeting();
  }
  if (!meeting) return;
  const recordButton = $('#recordButton');
  recordButton.disabled = true;
  try {
    const result = await window.electronAPI.startManualRecording(meeting.id);
    if (result.success) {
      state.currentRecordingId = result.recordingId;
      state.recordingState = 'recording';
      state.recordingStartedAt = Date.now();
      state.accumulatedRecordingMs = 0;
      renderRecordingState();
      startTimer();
    } else {
      showToast(result.error || 'Failed to start recording');
    }
  } catch (error) {
    console.error('Start recording failed:', error);
    showToast('Failed to start recording');
  } finally {
    recordButton.disabled = false;
  }
}

function pauseOrResumeRecording() {
  if (state.recordingState === 'recording') {
    state.accumulatedRecordingMs += Date.now() - state.recordingStartedAt;
    state.recordingStartedAt = null;
    state.recordingState = 'paused';
    showToast('Paused in the workspace. Recall recording remains active until Stop.');
  } else if (state.recordingState === 'paused') {
    state.recordingStartedAt = Date.now();
    state.recordingState = 'recording';
  }
  renderRecordingState();
}

async function stopRecording() {
  if (!state.currentRecordingId) return;
  const stopButton = $('#stopButton');
  stopButton.disabled = true;
  try {
    const result = await window.electronAPI.stopManualRecording(state.currentRecordingId);
    if (!result.success) {
      showToast(result.error || 'Failed to stop recording');
      return;
    }
    state.recordingState = 'idle';
    state.currentRecordingId = null;
    state.recordingStartedAt = null;
    state.accumulatedRecordingMs = 0;
    $('#elapsedTimer').textContent = '00:00:00';
    renderRecordingState();
  } catch (error) {
    console.error('Stop recording failed:', error);
    showToast('Failed to stop recording');
  } finally {
    stopButton.disabled = false;
  }
}

function switchTab(tab) {
  state.activeTab = tab;
  $$('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
  $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `${tab}Panel`));
}

function switchNotesTab(tab) {
  state.notesTab = tab;
  $$('[data-notes-tab]').forEach(button => button.classList.toggle('active', button.dataset.notesTab === tab));
  $('#simple-editor').classList.toggle('hidden', tab !== 'edit');
  $('#notesPreview').classList.toggle('hidden', tab !== 'preview');
  if (tab === 'preview') renderNotesPreview();
}

function addPrivateNote(text) {
  const meeting = getCurrentMeeting();
  if (!meeting) return;
  ensureMeetingShape(meeting);
  meeting.privateNotes.push({
    id: `private-${Date.now()}`,
    text,
    timestamp: new Date().toISOString(),
    private: true,
  });
  scheduleSave();
  renderTranscript(meeting);
}

function insertMarkdown(prefix) {
  const editor = $('#simple-editor');
  if (!editor) return;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.setRangeText(prefix, start, end, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

function buildShareText() {
  const meeting = getCurrentMeeting();
  if (!meeting) return '';
  const includePrivate = $('#includePrivateNotes')?.checked;
  const sections = [
    `# ${meeting.title || 'Meeting Notes'}`,
    '## Agenda',
    ...(meeting.agenda || []).map(item => `- ${item.text}${item.time ? ` (${item.time})` : ''}`),
    '## Notes',
    meeting.content || '',
    '## Transcript',
    ...(meeting.transcript || []).map(entry => `- ${formatTranscriptTime(entry.timestamp)} ${entry.speaker || 'Unknown'}: ${entry.text || ''}`),
  ];
  if (includePrivate) {
    sections.push('## Private timestamped notes');
    sections.push(...(meeting.privateNotes || []).map(entry => `- ${formatTranscriptTime(entry.timestamp)}: ${entry.text}`));
  }
  return sections.join('\n');
}

function bindEvents() {
  $('#newMeetingBtn').addEventListener('click', () => createNewMeeting());
  $('#recordButton').addEventListener('click', startRecording);
  $('#pauseButton').addEventListener('click', pauseOrResumeRecording);
  $('#stopButton').addEventListener('click', stopRecording);

  $('#noteTitle').addEventListener('blur', scheduleSave);
  $('#noteTitle').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  });

  $('#simple-editor').addEventListener('input', () => {
    const meeting = getCurrentMeeting();
    if (meeting) meeting.content = $('#simple-editor').value;
    $('#notesFocusEditor').value = $('#simple-editor').value;
    renderTasks(meeting);
    renderNotesPreview();
    scheduleSave();
  });

  $('#notesFocusEditor').addEventListener('input', () => {
    $('#simple-editor').value = $('#notesFocusEditor').value;
    $('#simple-editor').dispatchEvent(new Event('input', { bubbles: true }));
  });

  $('#summaryEditor').addEventListener('input', scheduleSave);

  $$('.tab').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  $$('[data-notes-tab]').forEach(button => {
    button.addEventListener('click', () => switchNotesTab(button.dataset.notesTab));
  });
  $$('.tool[data-insert]').forEach(button => {
    button.addEventListener('click', () => insertMarkdown(button.dataset.insert));
  });

  $('#editAgendaButton').addEventListener('click', () => {
    state.agendaEditMode = !state.agendaEditMode;
    $('#editAgendaButton').classList.toggle('active', state.agendaEditMode);
    $('#editAgendaButton').textContent = state.agendaEditMode ? 'Done' : 'Edit';
    renderAgenda(getCurrentMeeting());
    if (!state.agendaEditMode) scheduleSave();
  });

  $('#privateNoteInput').addEventListener('input', (event) => {
    $('#sendPrivateNote').disabled = event.target.value.trim().length === 0;
  });
  $('#privateNoteForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#privateNoteInput');
    const text = input.value.trim();
    if (!text) return;
    addPrivateNote(text);
    input.value = '';
    $('#sendPrivateNote').disabled = true;
  });

  $('#shareButton').addEventListener('click', () => $('#shareModal').classList.remove('hidden'));
  $('#closeShareModal').addEventListener('click', () => $('#shareModal').classList.add('hidden'));
  $('#doneShare').addEventListener('click', () => $('#shareModal').classList.add('hidden'));
  $('#copyShareText').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showToast('Share text copied. Private comments excluded unless selected.');
    } catch (error) {
      console.error('Clipboard write failed:', error);
      showToast('Could not copy share text');
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      createNewMeeting();
    }
  });
}

function bindIpcEvents() {
  window.electronAPI.onMeetingDetectionStatus((data) => {
    state.meetingDetected = Boolean(data.detected);
  });

  window.electronAPI.onOpenMeetingNote((meetingId) => {
    loadMeetingsDataFromFile().then(() => selectMeeting(meetingId));
  });

  window.electronAPI.onRecordingCompleted((meetingId) => {
    if (state.currentMeetingId === meetingId) {
      loadMeetingsDataFromFile().then(() => {
        renderSidebar();
        renderActiveMeeting();
      });
    }
  });

  window.electronAPI.onTranscriptUpdated((meetingId) => {
    if (state.currentMeetingId === meetingId) {
      loadMeetingsDataFromFile().then(() => {
        const meeting = getAllMeetings().find(item => item.id === meetingId);
        if (meeting) {
          state.currentMeetingId = meetingId;
          renderTranscript(meeting);
          renderTasks(meeting);
          renderSidebar();
        }
      });
    }
  });

  window.electronAPI.onParticipantsUpdated((meetingId) => {
    if (state.currentMeetingId === meetingId) {
      loadMeetingsDataFromFile().then(() => renderParticipantAvatars(getCurrentMeeting()));
    }
  });

  window.electronAPI.onMeetingTitleUpdated((data) => {
    loadMeetingsDataFromFile().then(() => {
      renderSidebar();
      if (state.currentMeetingId === data.meetingId) {
        $('#noteTitle').textContent = data.newTitle;
      }
    });
  });

  window.electronAPI.onSummaryGenerated((meetingId) => {
    if (state.currentMeetingId === meetingId) {
      loadMeetingsDataFromFile().then(renderActiveMeeting);
    }
  });

  window.electronAPI.onSummaryUpdate((data) => {
    if (state.currentMeetingId === data.meetingId) {
      $('#simple-editor').value = data.content;
      $('#notesFocusEditor').value = data.content;
      renderNotesPreview();
    }
  });

  window.electronAPI.onRecordingStateChange((data) => {
    if (data.noteId !== state.currentMeetingId) return;
    state.currentRecordingId = data.recordingId;
    state.recordingState = data.state === 'paused' ? 'paused' : data.state === 'recording' ? 'recording' : 'idle';
    state.recordingStartedAt = state.recordingState === 'recording' ? Date.now() : null;
    renderRecordingState();
  });
}

function initLoggerBridge() {
  window.sdkLoggerBridge?.onSdkLog?.(() => {});
  window.sdkLoggerBridge?.sendSdkLog?.({
    type: 'info',
    message: 'Meeting workspace renderer initialized',
    timestamp: new Date(),
    originatedFromRenderer: true,
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initLoggerBridge();
  bindEvents();
  bindIpcEvents();
  await loadMeetingsDataFromFile();
  const firstMeeting = getAllMeetings()[0];
  if (firstMeeting) {
    selectMeeting(firstMeeting.id);
  } else {
    renderSidebar();
    renderActiveMeeting();
  }
  switchTab('transcript');
  switchNotesTab('edit');
  startTimer();
  setInterval(() => {
    $('#privateNoteTime').textContent = formatTranscriptTime(new Date().toISOString());
  }, 30000);
});
