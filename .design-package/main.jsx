// Main content pane: header, tabs, recording controls, transcript, composer

const Header = ({ tab, setTab, tabCounts }) => (
  <>
    <div className="main-header">
      <button className="meeting-title-btn">
        Product Hunt Launch Meeting
        <IconChev size={14} className="chev" />
      </button>
      <div className="header-actions">
        <button className="btn-ghost">
          <IconShare size={14} /> Share
        </button>
        <div className="avatar-stack">
          <div className="avatar sp-1">JS</div>
          <div className="avatar sp-2">EC</div>
          <div className="avatar sp-3">DW</div>
          <div className="more">+2</div>
        </div>
        <button className="btn-icon"><IconMore size={16} /></button>
      </div>
    </div>
    <div className="tabs">
      {[
        { id: "summary", label: "Summary" },
        { id: "transcript", label: "Transcript" },
        { id: "notes", label: "Notes" },
        { id: "tasks", label: "Tasks" },
      ].map(t => (
        <button
          key={t.id}
          className={`tab ${tab === t.id ? "active" : ""}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
          {tabCounts[t.id] != null && <span className="tab-count">{tabCounts[t.id]}</span>}
        </button>
      ))}
    </div>
  </>
);

const Waveform = ({ state }) => {
  const bars = 22;
  return (
    <div className={`waveform ${state}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 6 + ((i * 7) % 16);
        const delay = (i * 0.07) % 1.1;
        return (
          <span
            key={i}
            className="bar"
            style={{ height: `${h}px`, animationDelay: `${delay}s` }}
          />
        );
      })}
    </div>
  );
};

const RecordingCard = ({ state, time, onPause, onResume, onStop, onStart }) => {
  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  if (state === "idle") {
    return (
      <div className="rec-card">
        <div className="rec-status idle">
          <span className="rec-dot" />
          Ready
        </div>
        <Waveform state="idle" />
        <div className="rec-time">00:00:00</div>
        <div className="rec-controls">
          <button className="rec-btn start-idle" onClick={onStart}>
            <span className="start-dot" />
            Start recording
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rec-card">
      <div className={`rec-status ${state === "paused" ? "paused" : ""}`}>
        <span className="rec-dot" />
        {state === "paused" ? "Paused" : "Recording"}
      </div>
      <Waveform state={state} />
      <div className="rec-time">{fmt(time)}</div>
      <div className="rec-controls">
        {state === "paused" ? (
          <button className="rec-btn" onClick={onResume} title="Resume"><IconPlay size={14} /></button>
        ) : (
          <button className="rec-btn" onClick={onPause} title="Pause"><IconPause size={14} /></button>
        )}
        <button className="rec-btn stop" onClick={onStop} title="Stop"><IconStop size={12} /></button>
      </div>
    </div>
  );
};

const Transcript = ({ entries, partialText, partialSpeaker }) => {
  const ref = React.useRef(null);
  const [stickToBottom, setStickToBottom] = React.useState(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      setStickToBottom(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (el && stickToBottom) el.scrollTop = el.scrollHeight;
  }, [entries, partialText, stickToBottom]);

  return (
    <div className="transcript" ref={ref}>
      {entries.map((e) => {
        if (e.type === "comment") {
          return (
            <div className="t-comment" key={e.id}>
              <div className="t-time" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-3)", paddingTop: 8 }}>
                {e.time}
              </div>
              <div className="t-comment-body">
                <IconPin size={13} className="icon" />
                <div>
                  <div className="t-comment-label">Private note</div>
                  <div>{e.text}</div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className={`t-entry ${e.fresh ? "new" : ""}`} key={e.id}>
            <div className="t-time">{e.time}</div>
            <div className="t-avatar">
              <div className={`avatar sm sp-${e.speakerColor}`}>{e.initials}</div>
            </div>
            <div className="t-body">
              <div className={`t-speaker s${e.speakerColor}`}>{e.speaker}</div>
              <div className="t-text">{e.text}</div>
            </div>
          </div>
        );
      })}
      {partialText && (
        <div className="t-entry">
          <div className="t-time">{partialSpeaker.time}</div>
          <div className="t-avatar">
            <div className={`avatar sm sp-${partialSpeaker.color}`}>{partialSpeaker.initials}</div>
          </div>
          <div className="t-body">
            <div className={`t-speaker s${partialSpeaker.color}`}>{partialSpeaker.name}</div>
            <div className="t-text"><span className="partial">{partialText}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

const Composer = ({ onSend, currentTime }) => {
  const [val, setVal] = React.useState("");
  const submit = () => {
    if (!val.trim()) return;
    onSend(val.trim());
    setVal("");
  };
  return (
    <div className="composer">
      <span className="pin"><IconPin size={15} /></span>
      <span className="ts">{currentTime}</span>
      <input
        placeholder="Add a private meeting note…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
      />
      <button className="send" disabled={!val.trim()} onClick={submit}>
        <IconSend size={14} />
      </button>
    </div>
  );
};

Object.assign(window, { Header, RecordingCard, Transcript, Composer });
